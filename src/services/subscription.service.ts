import { ObjectId } from "mongoose";
import {
  IResult,
  ISubscriptionDoc,
  IPlanDoc,
  IBillingInfo,
  IPaymentMethod,
} from "../utils/interface.util";
import {
  ETransactionsType,
  ETransactionStatus,
  EBillingFrequency,
  ESubscriptionStatus,
  EProviders,
} from "../utils/enums.util";
import TransactionService from "./transaction.service";
import EmailService from "./email.service";
import NotificationService from "./notification.service";
import Subscription from "../models/Subscription.model";
import Plan from "../models/Plan.model";
import User from "../models/User.model";
import {
  cancelSubscriptionDto,
  changePlanDTO,
  createSubscriptionDto,
  renewSubscriptionDto,
  updatePaymentMethodDTO,
} from "../dtos/billing.dto";

class SubscriptionService {
  private readonly transactionService: typeof TransactionService;
  private readonly maxRetries: number = 3;
  private readonly retryInterval: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly reminderDays: number = 3; // Days before expiry to send reminder

  constructor() {
    this.transactionService = TransactionService;
  }

  /**
   * Creates a new subscription for a user
   * @param {ObjectId} userId - User ID subscribing to the plan
   * @param {ObjectId} planId - Plan ID to subscribe to
   * @param {IPaymentMethod} paymentMethod - Payment method details
   * @param {string} frequency - Billing frequency (monthly/yearly)
   * @returns {Promise<IResult>} Subscription result
   */
  public async createSubscription(
    data: createSubscriptionDto
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    const { userId, planId, paymentMethod, frequency } = data;

    try {
      // Validate user and plan
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const plan = await Plan.findById(planId);
      if (!plan || !plan.isEnabled) {
        throw new Error("Plan not found or inactive");
      }

      // Check for existing active subscription
      const existingSubscription = await Subscription.findOne({
        user: userId,
        plan: planId,
        status: {
          $in: [ESubscriptionStatus.ACTIVE, ESubscriptionStatus.TRIAL],
        },
      });

      if (existingSubscription) {
        throw new Error("User already has an active subscription to this plan");
      }

      // Calculate billing details
      const billing = this.calculateBilling(plan, frequency);

      // Check if trial is available
      if (plan.trial.isActive) {
        // Create trial subscription
        const subscription = await this.createTrialSubscription(
          userId,
          plan,
          billing
        );

        // Send confirmation
        
        result.message = "Trial subscription created successfully";
        result.data = subscription;
        return result;
      }

      // Process payment for paid subscription
      const amount =
        frequency === EBillingFrequency.MONTHLY
          ? plan.pricing.monthly
          : plan.pricing.yearly;

      const paymentResult = await this.transactionService.processTransaction({
        userId,
        amount,
        paymentMethod,
        planId,
      });

      if (paymentResult.error) {
        throw new Error(`Payment failed: ${paymentResult.message}`);
      }

      // Create subscription record
      const subscription = await this.createPaidSubscription(
        userId,
        plan,
        billing,
        paymentResult.data._id
      );

      // Send confirmation
      

      result.message = "Subscription created successfully";
      result.data = subscription;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Renews an existing subscription
   * @param {ObjectId} subscriptionId - Subscription ID to renew
   * @param {IPaymentMethod} paymentMethod - Payment method details
   * @returns {Promise<IResult>} Renewal result
   */
  public async renewSubscription(data: renewSubscriptionDto): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    const { subscriptionId, paymentMethod } = data;

    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate("plan")
        .populate("user");

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      if (subscription.status === ESubscriptionStatus.ACTIVE) {
        throw new Error("Subscription is already active");
      }

      const plan = subscription.plan as IPlanDoc;
      const userId = subscription.user._id;
      const planId = subscription.plan._id;

      // Calculate new billing period
      const frequency = subscription.billing.frequency;
      const billing = this.calculateBilling(plan, frequency);

      // Process payment
      const amount =
        frequency === EBillingFrequency.MONTHLY
          ? plan.pricing.monthly
          : plan.pricing.yearly;

      const paymentResult = await this.transactionService.processTransaction({
        userId,
        amount,
        paymentMethod,
        planId,
      });

      if (paymentResult.error) {
        throw new Error(`Renewal payment failed: ${paymentResult.message}`);
      }

      // Update subscription
      subscription.status = ESubscriptionStatus.ACTIVE;
      subscription.isPaid = true;
      subscription.billing = billing;

      // Add transaction to subscription
      subscription.transactions.push(paymentResult.data._id);

      await subscription.save();

      // Send confirmation
      

      result.message = "Subscription renewed successfully";
      result.data = subscription;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Cancels an existing subscription
   * @param {ObjectId} subscriptionId - Subscription ID to cancel
   * @param {string} reason - Reason for cancellation
   * @returns {Promise<IResult>} Cancellation result
   */
  public async cancelSubscription(
    data: cancelSubscriptionDto
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    const { subscriptionId, reason } = data;

    try {
      const subscription = await Subscription.findById(subscriptionId).populate(
        "user"
      );
      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const userId = subscription.user._id;
      const isTrial = subscription.status === ESubscriptionStatus.TRIAL;

      // If on trial, cancel immediately
      if (isTrial) {
        subscription.status = ESubscriptionStatus.CANCELLED;
        await subscription.save();

        

        result.message = "Trial subscription cancelled successfully";
        result.data = subscription;
        return result;
      }

      // If paid, continue access until the end of the billing cycle
      // Just mark as cancelled for now, actual cancellation happens at billing cycle end
      subscription.status = ESubscriptionStatus.CANCELLED;
      subscription.metadata = {
        ...subscription.metadata,
        cancelledAt: new Date(),
        cancelReason: reason,
        nextBillingDate: subscription.billing.dueDate,
        autoRenew: false,
      };

      await subscription.save();

      

      result.message =
        "Subscription will be cancelled at the end of the billing cycle";
      result.data = subscription;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Upgrades or downgrades a subscription to a different plan
   * @param {ObjectId} subscriptionId - Current subscription ID
   * @param {ObjectId} newPlanId - New plan ID to change to
   * @param {IPaymentMethod} paymentMethod - Payment method for additional charges
   * @returns {Promise<IResult>} Change plan result
   */
  public async changePlan(data: changePlanDTO): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    const { subscriptionId, newPlanId, paymentMethod } = data;

    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate("plan")
        .populate("user");

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const newPlan = await Plan.findById(newPlanId);
      if (!newPlan || !newPlan.isEnabled) {
        throw new Error("New plan not found or inactive");
      }

      const currentPlan = subscription.plan as IPlanDoc;
      const userId = subscription.user._id;
      const frequency = subscription.billing.frequency;

      // Check if it's an upgrade or downgrade
      const isUpgrade = this.isPlanUpgrade(currentPlan, newPlan, frequency);

      if (isUpgrade) {
        // Calculate prorated amount for upgrade
        const proratedAmount = this.calculateProratedAmount(
          subscription,
          currentPlan,
          newPlan,
          frequency
        );

        // Process payment for the difference
        if (proratedAmount > 0) {
          const paymentResult = await this.transactionService.createTransaction(
            {
              userId,
              amount: proratedAmount,
              paymentMethod,
              planId: newPlanId,
              type: ETransactionsType.UPGRADE,
              description: `Plan upgrade from ${currentPlan.name} to ${newPlan.name}`,
              metadata: [{
                previousPlan: currentPlan._id,
                newPlan: newPlanId,
                proratedAmount: proratedAmount,
              }],
            }
          );

          if (paymentResult.error) {
            throw new Error(`Upgrade payment failed: ${paymentResult.message}`);
          }

          // Add transaction to subscription
          subscription.transactions.push(paymentResult.data._id);
        }

        // Update subscription with new plan immediately
        const billing = this.calculateBilling(newPlan, frequency);
        subscription.plan = newPlanId;
        subscription.billing = billing;

        await subscription.save();

        

        result.message = "Subscription upgraded successfully";
      } else {
        // For downgrades, mark for change at end of billing cycle
        subscription.metadata = {
          ...subscription.metadata,
          lastBillingDate: subscription.billing.paidDate,
          nextBillingDate: subscription.billing.dueDate,
          billingCycle: subscription.billing.frequency,
          autoRenew: false,
          downgradedFrom: currentPlan._id.toString(),

          // Keep existing metadata properties
          cancelledAt: subscription.metadata?.cancelledAt,
          cancelReason: subscription.metadata?.cancelReason,
          upgradedFrom: subscription.metadata?.upgradedFrom,
          promotionCode: subscription.metadata?.promotionCode,
          promotionExpiry: subscription.metadata?.promotionExpiry,
        };

        await subscription.save();

        

        result.message =
          "Subscription will be downgraded at the end of the billing cycle";
      }

      result.data = subscription;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Updates payment method for a subscription
   * @param {ObjectId} subscriptionId - Subscription ID
   * @param {IPaymentMethod} paymentMethod - New payment method details
   * @returns {Promise<IResult>} Update result
   */
  public async updatePaymentMethod(
    data: updatePaymentMethodDTO
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    const { subscriptionId, paymentMethod } = data;

    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate("plan")
        .populate("user");

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const userId = subscription.user._id;
      const plan = subscription.plan as IPlanDoc;

      // Create a transaction record for the payment method update
      const transaction = await this.transactionService.createTransaction({
        userId,
        planId: plan._id,
        amount: 0,
        paymentMethod,
        type: ETransactionsType.PAYMENT_METHOD_UPDATE,
        description: `Payment method update for subscription ${subscription.code}`,
        resource: "payment_method",
        metadata: [
          {
            subscriptionId: subscription._id,
            updateType: "payment_method",
          },
        ],
      });

      if (transaction.error) {
        throw new Error(`Payment method update failed: ${transaction.message}`);
      }

      const verificationResult =
        await this.transactionService.verifyPaymentMethod({
          transactionId: transaction.data._id,
          paymentMethod,
        });
      if (verificationResult.error) {
        throw new Error(
          `Payment method verification failed: ${verificationResult.message}`
        );
      }

      // Update subscription metadata with proper typing
      const updatedMetadata = {
        ...subscription.metadata,
        paymentMethod: {
          type: paymentMethod.type,
          last4: paymentMethod.card?.cardLast,
          provider: paymentMethod.card?.provider,
          updatedAt: new Date().toISOString(),
        },
      };

      subscription.metadata = updatedMetadata;
      await subscription.save();

      result.message = "Payment method updated successfully";
      result.data = subscription;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Processes a refund for a subscription
   * @param {ObjectId} subscriptionId - Subscription ID
   * @param {string} reason - Reason for refund
   * @returns {Promise<IResult>} Refund result
   */
  public async processRefund(
    subscriptionId: ObjectId,
    reason: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate("transactions")
        .populate("user");

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      if (!subscription.isPaid) {
        throw new Error("No payment found for this subscription");
      }

      const userId = subscription.user._id;

      // Get the latest transaction
      const transactions = subscription.transactions;
      if (!transactions || transactions.length === 0) {
        throw new Error("No transactions found for this subscription");
      }

      const latestTransaction = transactions[transactions.length - 1];

      // Process refund through transaction service
      const refundResult = await this.transactionService.processRefund(
        latestTransaction._id,
        reason
      );

      if (refundResult.error) {
        throw new Error(`Refund failed: ${refundResult.message}`);
      }

      // Update subscription status
      subscription.status = ESubscriptionStatus.CANCELLED;
      subscription.metadata = {
        ...subscription.metadata,
        cancelReason: reason,
        nextBillingDate: subscription.billing.dueDate,
      };

      await subscription.save();

      // Notify user of refund
  
      result.message = "Refund processed successfully";
      result.data = { subscription, refund: refundResult.data };
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Gets all active subscriptions for a user
   * @param {ObjectId} userId - User ID
   * @returns {Promise<IResult>} User subscriptions
   */
  public async getUserSubscriptions(userId: ObjectId): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const subscriptions = await Subscription.find({
        user: userId,
        status: {
          $in: [ESubscriptionStatus.ACTIVE, ESubscriptionStatus.TRIAL],
        },
      }).populate("plan");

      result.message = "User subscriptions retrieved successfully";
      result.data = subscriptions;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Gets subscription details by ID
   * @param {ObjectId} subscriptionId - Subscription ID
   * @returns {Promise<IResult>} Subscription details
   */
  public async getSubscriptionDetails(
    subscriptionId: ObjectId
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate("plan")
        .populate("user")
        .populate("transactions");

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      result.message = "Subscription details retrieved successfully";
      result.data = subscription;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Checks if a user has an active subscription
   * @param {ObjectId} userId - User ID
   * @returns {Promise<boolean>} True if user has active subscription
   */
  public async hasActiveSubscription(userId: ObjectId): Promise<boolean> {
    const subscription = await Subscription.findOne({
      user: userId,
      status: { $in: [ESubscriptionStatus.ACTIVE, ESubscriptionStatus.TRIAL] },
    });

    return !!subscription;
  }

  /**
   * Processes subscriptions that need renewal
   * This should be called by a scheduled job
   * @returns {Promise<void>}
   */
  public async processSubscriptionRenewals(): Promise<void> {
    try {
      // Find subscriptions due for renewal (due date is today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueSubscriptions = await Subscription.find({
        status: ESubscriptionStatus.ACTIVE,
        "billing.dueDate": {
          $gte: today,
          $lt: tomorrow,
        },
      })
        .populate("user")
        .populate("plan");

      for (const subscription of dueSubscriptions) {
        await this.processRenewal(subscription);
      }

      // Process subscriptions that should be expired
      const expiredSubscriptions = await Subscription.find({
        status: ESubscriptionStatus.ACTIVE,
        "billing.dueDate": { $lt: today },
      }).populate("user");

      for (const subscription of expiredSubscriptions) {
        await this.expireSubscription(subscription);
      }

      // Process subscriptions that need downgrade at end of cycle
      const downgradeDueSubscriptions = await Subscription.find({
        "metadata.planChangeType": "downgrade",
        "billing.dueDate": {
          $gte: today,
          $lt: tomorrow,
        },
      }).populate("user");

      for (const subscription of downgradeDueSubscriptions) {
        await this.processDowngrade(subscription);
      }

      // Send reminders for subscriptions about to expire
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + this.reminderDays);

      const reminderEndDate = new Date(reminderDate);
      reminderEndDate.setDate(reminderEndDate.getDate() + 1);

      const reminderSubscriptions = await Subscription.find({
        status: ESubscriptionStatus.ACTIVE,
        "billing.dueDate": {
          $gte: reminderDate,
          $lt: reminderEndDate,
        },
      })
        .populate("user")
        .populate("plan");

      for (const subscription of reminderSubscriptions) {
        //await this.sendExpiryReminder(subscription);
      }
    } catch (error) {
      console.error("Error processing subscription renewals:", error);
    }
  }

  /**
   * Creates a trial subscription
   * @param {ObjectId} userId - User ID
   * @param {IPlanDoc} plan - Plan document
   * @param {IBillingInfo} billing - Billing information
   * @returns {Promise<ISubscriptionDoc>} Created subscription
   * @private
   */
  private async createTrialSubscription(
    userId: ObjectId,
    plan: IPlanDoc,
    billing: IBillingInfo
  ): Promise<ISubscriptionDoc> {
    const subscription = new Subscription({
      code: this.generateSubscriptionCode(userId, plan._id),
      isPaid: false,
      status: ESubscriptionStatus.TRIAL,
      slug: `${userId}-${plan.slug}-${Date.now()}`,
      billing,
      user: userId,
      transactions: [],
      plan: plan._id,
      metadata: [{ trialStarted: true }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _versions: 1,
    });

    await subscription.save();
    return subscription;
  }

  /**
   * Creates a paid subscription
   * @param {ObjectId} userId - User ID
   * @param {IPlanDoc} plan - Plan document
   * @param {IBillingInfo} billing - Billing information
   * @param {ObjectId} transactionId - Transaction ID
   * @returns {Promise<ISubscriptionDoc>} Created subscription
   * @private
   */
  private async createPaidSubscription(
    userId: ObjectId,
    plan: IPlanDoc,
    billing: IBillingInfo,
    transactionId: ObjectId
  ): Promise<ISubscriptionDoc> {
    const subscription = new Subscription({
      code: this.generateSubscriptionCode(userId, plan._id),
      isPaid: true,
      status: ESubscriptionStatus.ACTIVE,
      slug: `${userId}-${plan.slug}-${Date.now()}`,
      billing,
      user: userId,
      transactions: [transactionId],
      plan: plan._id,
      metadata: [{ subscriptionStarted: true }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _versions: 1,
    });

    await subscription.save();
    return subscription;
  }

  /**
   * Calculates billing information for a subscription
   * @param {IPlanDoc} plan - Plan document
   * @param {string} frequency - Billing frequency
   * @returns {IBillingInfo} Billing information
   * @private
   */
  private calculateBilling(plan: IPlanDoc, frequency: string): IBillingInfo {
    const now = new Date();
    const startDate = new Date(now);

    // Set due date based on frequency
    const dueDate = new Date(now);
    if (frequency === EBillingFrequency.MONTHLY) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    } else {
      dueDate.setFullYear(dueDate.getFullYear() + 1);
    }

    // Set grace period (7 days after due date)
    const graceDate = new Date(dueDate);
    graceDate.setDate(graceDate.getDate() + 7);

    return {
      amount:
        frequency === EBillingFrequency.MONTHLY
          ? plan.pricing.monthly
          : plan.pricing.yearly,
      startDate,
      paidDate: now,
      dueDate,
      graceDate,
      frequency,
    };
  }

  /**
   * Generates a unique subscription code
   * @param {ObjectId} userId - User ID
   * @param {ObjectId} planId - Plan ID
   * @returns {string} Subscription code
   * @private
   */
  private generateSubscriptionCode(userId: ObjectId, planId: ObjectId): string {
    return `SUB-${userId.toString().substring(0, 5)}-${planId
      .toString()
      .substring(0, 5)}-${Date.now().toString(36)}`;
  }

  /**
   * Determines if changing to a new plan is an upgrade
   * @param {IPlanDoc} currentPlan - Current plan
   * @param {IPlanDoc} newPlan - New plan
   * @param {string} frequency - Billing frequency
   * @returns {boolean} True if it's an upgrade
   * @private
   */
  private isPlanUpgrade(
    currentPlan: IPlanDoc,
    newPlan: IPlanDoc,
    frequency: string
  ): boolean {
    if (frequency === EBillingFrequency.MONTHLY) {
      return newPlan.pricing.monthly > currentPlan.pricing.monthly;
    } else {
      return newPlan.pricing.yearly > currentPlan.pricing.yearly;
    }
  }

  /**
   * Calculates prorated amount for plan change
   * @param {ISubscriptionDoc} subscription - Current subscription
   * @param {IPlanDoc} currentPlan - Current plan
   * @param {IPlanDoc} newPlan - New plan
   * @param {string} frequency - Billing frequency
   * @returns {number} Prorated amount
   * @private
   */
  private calculateProratedAmount(
    subscription: ISubscriptionDoc,
    currentPlan: IPlanDoc,
    newPlan: IPlanDoc,
    frequency: string
  ): number {
    const now = new Date();
    const dueDate = new Date(subscription.billing.dueDate);
    const startDate = new Date(subscription.billing.startDate);

    // Calculate total days in billing cycle
    const totalDays = Math.floor(
      (dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate days remaining in current cycle
    const daysRemaining = Math.floor(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate proportion of cycle remaining
    const proportionRemaining = daysRemaining / totalDays;

    // Calculate prorated refund for current plan
    const currentAmount =
      frequency === EBillingFrequency.MONTHLY
        ? currentPlan.pricing.monthly
        : currentPlan.pricing.yearly;

    const refundAmount = currentAmount * proportionRemaining;

    // Calculate prorated charge for new plan
    const newAmount =
      frequency === EBillingFrequency.MONTHLY
        ? newPlan.pricing.monthly
        : newPlan.pricing.yearly;

    const chargeAmount = newAmount * proportionRemaining;

    // Return difference (positive means additional charge)
    return Math.round((chargeAmount - refundAmount) * 100) / 100;
  }

  /**
   * Processes renewal for a subscription
   * @param {ISubscriptionDoc} subscription - Subscription to renew
   * @returns {Promise<void>}
   * @private
   */
  private async processRenewal(subscription: ISubscriptionDoc): Promise<void> {
    try {
      const userId = subscription.user._id;
      const plan = subscription.plan as unknown as IPlanDoc;
      const planId = subscription.plan._id;

      // Get latest payment method from last transaction
      const transactions = subscription.transactions;
      if (!transactions || transactions.length === 0) {
        await this.expireSubscription(subscription);
        return;
      }

      const latestTransaction = transactions[transactions.length - 1];

      // Calculate new billing period
      const frequency = subscription.billing.frequency;
      const billing = this.calculateBilling(plan, frequency);

      // Process payment
      const amount =
        frequency === EBillingFrequency.MONTHLY
          ? plan.pricing.monthly
          : plan.pricing.yearly;

      // Attempt payment with retry logic
      let paymentSuccess = false;
      let attempts = 0;
      let paymentResult;

      while (!paymentSuccess && attempts < this.maxRetries) {
        try {
          // We would need to extract payment method from the transaction
          // This is simplified here
          const paymentMethod = {
            email: latestTransaction.email || "",
            type: latestTransaction.channel || "card",
            card: latestTransaction.card,
          };

          paymentResult = await this.transactionService.processTransaction({
            userId,
            amount,
            paymentMethod,
            planId,
          });

          if (!paymentResult.error) {
            paymentSuccess = true;
          } else {
            attempts++;
            if (attempts < this.maxRetries) {
              // Wait before retry
              await new Promise((resolve) =>
                setTimeout(resolve, this.retryInterval)
              );
            }
          }
        } catch (error) {
          attempts++;
          if (attempts < this.maxRetries) {
            // Wait before retry
            await new Promise((resolve) =>
              setTimeout(resolve, this.retryInterval)
            );
          }
        }
      }

      if (paymentSuccess && paymentResult) {
        // Update subscription
        subscription.status = ESubscriptionStatus.ACTIVE;
        subscription.isPaid = true;
        subscription.billing = billing;
        subscription.transactions.push(paymentResult.data._id);
        subscription.updatedAt = new Date().toISOString();

        await subscription.save();

        // Notify user of successful renewal
        
      } else {
        // Payment failed after all retries
        await this.expireSubscription(subscription);
      }
    } catch (error) {
      console.error("Error processing subscription renewal:", error);
      await this.expireSubscription(subscription);
    }
  }

  /**
   * Expires a subscription
   * @param {ISubscriptionDoc} subscription - Subscription to expire
   * @returns {Promise<void>}
   * @private
   */
  private async expireSubscription(
    subscription: ISubscriptionDoc
  ): Promise<void> {
    try {
      const userId = subscription.user._id;

      subscription.status = ESubscriptionStatus.EXPIRED;
      subscription.updatedAt = new Date().toISOString();

      await subscription.save();
    } catch (error) {
      console.error("Error expiring subscription:", error);
    }
  }

  /**
   * Processes a subscription that needs to be downgraded
   * @param {ISubscriptionDoc} subscription - Subscription to downgrade
   * @returns {Promise<void>}
   * @private
   */

  private async processDowngrade(subscription: ISubscriptionDoc): Promise<void> {
    try {
      
      const newPlanId = subscription.plan._id;
      const newPlan = await Plan.findById(newPlanId);

      if (!newPlan) {
        return;
      }

      const frequency = subscription.billing.frequency;
      const billing = this.calculateBilling(newPlan, frequency);

      // Update subscription with new plan
      subscription.plan = newPlanId;
      subscription.billing = billing;
      subscription.updatedAt = new Date().toISOString();

      // Update metadata after downgrade
      subscription.metadata = {
        ...subscription.metadata,
        downgradedFrom: subscription.plan,
        nextBillingDate: billing.dueDate,
        autoRenew: true
      };

      await subscription.save();

    } catch (error) {
      console.error("Error processing subscription downgrade:", error);
    }
}
}

export default new SubscriptionService
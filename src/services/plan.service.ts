import { ObjectId } from "mongoose";
import { IResult, IPlanDoc } from "../utils/interface.util";
import PlanModel from "../models/Plan.model";
import SubscriptionModel from "../models/Subscription.model";

/**
 * Service for managing subscription plans
 * @class PlanService
 */
class PlanService {
  /**
   * Gets all available plans
   * @param {boolean} includeDisabled - Whether to include disabled plans
   * @returns {Promise<IResult>} Available plans
   */
  public async getAvailablePlans(includeDisabled: boolean = false): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const query = includeDisabled ? {} : { isEnabled: true };
      const plans = await PlanModel.find(query).sort({ 'pricing.monthly': 1 });

      result.message = "Plans retrieved successfully";
      result.data = plans;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Gets plan details by ID
   * @param {ObjectId} planId - Plan ID
   * @returns {Promise<IResult>} Plan details
   */
  public async getPlanDetails(planId: ObjectId): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const plan = await PlanModel.findById(planId);

      if (!plan) {
        throw new Error("Plan not found");
      }

      result.message = "Plan details retrieved successfully";
      result.data = plan;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Creates a new plan
   * @param {IPlanDoc} planData - Plan data
   * @returns {Promise<IResult>} Created plan
   */
  public async createPlan(planData: Partial<IPlanDoc>): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      // Validate required fields
      if (!planData.name || !planData.pricing) {
        throw new Error("Plan name and pricing are required");
      }

      // Generate slug if not provided
      if (!planData.slug) {
        planData.slug = this.generateSlug(planData.name);
      }

      // Set default values
      const newPlan = {
        ...planData,
        isEnabled: planData.isEnabled !== undefined ? planData.isEnabled : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _versions: 1
      };

      const plan = new PlanModel(newPlan);
      await plan.save();

      result.message = "Plan created successfully";
      result.data = plan;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Updates an existing plan
   * @param {ObjectId} planId - Plan ID to update
   * @param {Partial<IPlanDoc>} planData - Updated plan data
   * @returns {Promise<IResult>} Updated plan
   */
  public async updatePlan(planId: ObjectId, planData: Partial<IPlanDoc>): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const plan = await PlanModel.findById(planId);

      if (!plan) {
        throw new Error("Plan not found");
      }

      // Update fields
      Object.keys(planData).forEach((key) => {
        if (key !== '_id' && key !== 'createdAt' && key !== '_versions') {
          // @ts-ignore
          plan[key] = planData[key];
        }
      });

      // Update metadata
      plan.updatedAt = new Date().toISOString();
      plan._versions = (plan._versions || 0) + 1;

      await plan.save();

      result.message = "Plan updated successfully";
      result.data = plan;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Deletes a plan
   * @param {ObjectId} planId - Plan ID to delete
   * @returns {Promise<IResult>} Deletion result
   */
  public async deletePlan(planId: ObjectId): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      // Check if plan is in use by any subscriptions
      const subscriptionsUsingPlan = await SubscriptionModel.countDocuments({ plan: planId });

      if (subscriptionsUsingPlan > 0) {
        throw new Error("Cannot delete plan that is in use by active subscriptions");
      }

      const deletedPlan = await PlanModel.findByIdAndDelete(planId);

      if (!deletedPlan) {
        throw new Error("Plan not found");
      }

      result.message = "Plan deleted successfully";
      result.data = deletedPlan;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Enables or disables a plan
   * @param {ObjectId} planId - Plan ID to update
   * @param {boolean} isEnabled - Whether to enable or disable the plan
   * @returns {Promise<IResult>} Update result
   */
  public async togglePlanStatus(planId: ObjectId, isEnabled: boolean): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const plan = await PlanModel.findById(planId);

      if (!plan) {
        throw new Error("Plan not found");
      }

      // If disabling a plan, check if it's in use
      if (!isEnabled) {
        const activeSubscriptions = await SubscriptionModel.countDocuments({
          plan: planId,
          status: "active"
        });

        if (activeSubscriptions > 0) {
          throw new Error("Cannot disable plan that is in use by active subscriptions");
        }
      }

      plan.isEnabled = isEnabled;
      plan.updatedAt = new Date().toISOString();
      await plan.save();

      const status = isEnabled ? "enabled" : "disabled";
      result.message = `Plan ${status} successfully`;
      result.data = plan;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Compares features between two plans
   * @param {ObjectId} planId1 - First plan ID
   * @param {ObjectId} planId2 - Second plan ID
   * @returns {Promise<IResult>} Comparison result
   */
  public async comparePlans(planId1: ObjectId, planId2: ObjectId): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const plan1 = await PlanModel.findById(planId1);
      const plan2 = await PlanModel.findById(planId2);

      if (!plan1 || !plan2) {
        throw new Error("One or both plans not found");
      }

      // Create comparison object
      const comparison = {
        plans: [plan1, plan2],
        pricingDifference: {
          monthly: plan2.pricing.monthly - plan1.pricing.monthly,
          yearly: plan2.pricing.yearly - plan1.pricing.yearly,
          percentageMonthly: ((plan2.pricing.monthly - plan1.pricing.monthly) / plan1.pricing.monthly) * 100,
          percentageYearly: ((plan2.pricing.yearly - plan1.pricing.yearly) / plan1.pricing.yearly) * 100
        },
        featureComparison: this.compareFeatures(plan1, plan2)
      };

      result.message = "Plan comparison completed successfully";
      result.data = comparison;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Gets all plans with their subscription counts
   * @returns {Promise<IResult>} Plans with subscription counts
   */
  public async getPlansWithStats(): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const plans = await PlanModel.find();
      const planStats = [];

      for (const plan of plans) {
        const activeSubscriptions = await SubscriptionModel.countDocuments({
          plan: plan._id,
          status: "active"
        });

        const trialSubscriptions = await SubscriptionModel.countDocuments({
          plan: plan._id,
          status: "trial"
        });

        planStats.push({
          plan,
          stats: {
            activeSubscriptions,
            trialSubscriptions,
            totalSubscriptions: activeSubscriptions + trialSubscriptions
          }
        });
      }

      result.message = "Plan statistics retrieved successfully";
      result.data = planStats;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Gets plans that are eligible for trial
   * @returns {Promise<IResult>} Trial-eligible plans
   */
  public async getTrialEligiblePlans(): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const plans = await PlanModel.find({
        isEnabled: true,
        'trial.isActive': true
      });

      result.message = "Trial-eligible plans retrieved successfully";
      result.data = plans;
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Checks if a user is eligible for a trial on a specific plan
   * @param {ObjectId} userId - User ID
   * @param {ObjectId} planId - Plan ID
   * @returns {Promise<IResult>} Trial eligibility result
   */
  public async checkTrialEligibility(userId: ObjectId, planId: ObjectId): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      // Check if plan exists and has trial enabled
      const plan = await PlanModel.findById(planId);
      
      if (!plan) {
        throw new Error("Plan not found");
      }
      
      if (!plan.isEnabled) {
        throw new Error("Plan is not currently available");
      }
      
      if (!plan.trial.isActive) {
        result.message = "This plan does not offer a trial";
        result.data = { isEligible: false, reason: "no_trial_available" };
        return result;
      }
      
      // Check if user has previously used a trial for this plan
      const previousTrial = await SubscriptionModel.findOne({
        user: userId,
        plan: planId,
        status: { $in: ["trial", "active", "cancelled", "expired"] },
        "metadata.trialStarted": true
      });
      
      if (previousTrial) {
        result.message = "User has already used a trial for this plan";
        result.data = { isEligible: false, reason: "previous_trial_used" };
        return result;
      }
      
      // User is eligible for trial
      result.message = "User is eligible for trial";
      result.data = { 
        isEligible: true, 
        trialDays: plan.trial.days,
        plan: plan
      };
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  /**
   * Generates a slug from a plan name
   * @param {string} name - Plan name
   * @returns {string} Generated slug
   * @private
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Compares features between two plans
   * @param {IPlanDoc} plan1 - First plan
   * @param {IPlanDoc} plan2 - Second plan
   * @returns {Object} Feature comparison
   * @private
   */
  private compareFeatures(plan1: IPlanDoc, plan2: IPlanDoc): any {
    const allFeatureKeys = new Set([
      ...(plan1.features ? Object.keys(plan1.features) : []),
      ...(plan2.features ? Object.keys(plan2.features) : [])
    ]);
    
    const comparison: Record<string, any> = {};
    
    allFeatureKeys.forEach(key => {
      const feature1 = plan1.features?.[key];
      const feature2 = plan2.features?.[key];
      
      comparison[key] = {
        plan1: feature1,
        plan2: feature2,
        difference: this.compareFeatureValues(feature1, feature2)
      };
    });
    
    return comparison;
  }

  /**
   * Compares individual feature values
   * @param {any} value1 - First feature value
   * @param {any} value2 - Second feature value
   * @returns {string|number} Comparison result
   * @private
   */
  private compareFeatureValues(value1: any, value2: any): string | number {
    // If both are numbers, return the difference
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      return value2 - value1;
    }
    
    // If both are booleans, compare them
    if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
      if (value1 === value2) return 'same';
      if (value1 === false && value2 === true) return 'upgrade';
      return 'downgrade';
    }
    
    // If one is undefined, the feature is only in one plan
    if (value1 === undefined) return 'only_in_plan2';
    if (value2 === undefined) return 'only_in_plan1';
    
    // For other types, just indicate if they're different
    return value1 === value2 ? 'same' : 'different';
  }
}

export default new PlanService();
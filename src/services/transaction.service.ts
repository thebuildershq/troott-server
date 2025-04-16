import { ObjectId } from "mongoose";
import PaystackProvider from "./paystack.service";
import EmailService from "./email.service";
import NotificationService from "./notification.service";
import SystemService from "./system.service";
import User from "../models/User.model";
import Transaction from "../models/Transaction.model";
import { processTransactionDTO, verifyPaymentDTO } from "../dtos/billing.dto";
import { IResult, ITransactionDoc, ISensitiveData, IPaymentMethod } from "../utils/interface.util";
import { ETransactionsType, ETransactionStatus } from "../utils/enums.util";



class TransactionService {
    private maxRetries: number = 3;
    private readonly paystackProvider: PaystackProvider;
    private readonly systemService: typeof SystemService;
    private readonly encryptionKey: string;

  constructor() {
    this.paystackProvider = new PaystackProvider();
    this.systemService = SystemService;
    this.encryptionKey = process.env.TRANSACTION_ENCRYPTION_KEY as string;
  }

   /**
   * @method processTransaction
   * @description Process a new payment transaction
   * @param {ObjectId} userId - User initiating the transaction
   * @param {number} amount - Transaction amount in base currency
   * @param {any} paymentMethod - Payment method details
   * @param {ObjectId} [planId] - Optional subscription plan ID
   * @returns {Promise<IResult>} Transaction result with encrypted sensitive data
   * @throws {Error} When transaction validation or processing fails
   */
  public async processTransaction( data: processTransactionDTO  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const { userId, amount, paymentMethod, planId } = data;

    try {
      await this.validateTransactionRequest(userId, amount, paymentMethod);

      const reference = this.generateReference(userId);
      if (await this.isDuplicateTransaction(reference)) {
        throw new Error("Duplicate transaction detected");
      }

      const paymentResult = await this.processPaymentWithRetry(
        amount,
        paymentMethod,
        reference
      );

      const transaction = await this.recordTransaction({
        type: planId ? ETransactionsType.SUBSCRIPTION : ETransactionsType.ONETIME,
        medium: paymentMethod.type,
        resource: planId ? 'subscription' : 'payment',
        entity: 'transaction',
        reference,
        currency: 'NGN',
        providerRef: paymentResult.providerRef,
        providerName: 'paystack',
        description: `Payment for ${planId ? 'subscription' : 'one-time purchase'}`,
        narration: `Payment of ${amount} NGN`,
        amount,
        unitAmount: amount * 100,
        fee: paymentResult.fee || 0,
        unitFee: (paymentResult.fee || 0) * 100,
        status: ETransactionStatus.PENDING,
        channel: paymentMethod.type,
        slug: `${userId}-${Date.now()}`,
        user: userId,
        card: paymentResult.card,
        providerData: [paymentResult],
        metadata: [{ planId }]
      });

      result.message = "Transaction processed successfully";
      result.data = this.sanitizeTransactionData(transaction);
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  public async createTransaction(
    transactionData: {
      userId: ObjectId;
      amount: number;
      paymentMethod: IPaymentMethod;
      type: ETransactionsType;
      description: string;
      metadata?: Record<string, any>[];
      resource?: string;
      planId?: ObjectId;
    }
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    const { userId, amount, paymentMethod, type, description, metadata, resource, planId } = transactionData;

    try {
      await this.validateTransactionRequest(userId, amount, paymentMethod);

      const reference = this.generateReference(userId);
      if (await this.isDuplicateTransaction(reference)) {
        throw new Error("Duplicate transaction detected");
      }

      const paymentResult = await this.processPaymentWithRetry(
        amount,
        paymentMethod,
        reference
      );

      const transaction = await this.recordTransaction({
        type,
        medium: paymentMethod.type,
        resource: resource || 'payment',
        entity: 'transaction',
        reference,
        currency: 'NGN',
        providerRef: paymentResult.providerRef,
        providerName: 'paystack',
        description,
        narration: `Payment of ${amount} NGN`,
        amount,
        unitAmount: amount * 100,
        fee: paymentResult.fee || 0,
        unitFee: (paymentResult.fee || 0) * 100,
        status: ETransactionStatus.PENDING,
        channel: paymentMethod.type,
        slug: `${userId}-${Date.now()}`,
        user: userId,
        card: paymentResult.card,
        providerData: [paymentResult],
        metadata: metadata || [{ planId }]
      });

      result.message = "Transaction created successfully";
      result.data = await this.sanitizeTransactionData(transaction);
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  private async recordTransaction(transactionData: any): Promise<ITransactionDoc> {
    // Encrypt sensitive data
    const sensitiveData = {
      card: transactionData.card,
      providerRef: transactionData.providerRef,
      providerData: transactionData.providerData
    };

    const encryptedData = await this.systemService.encryptData({
      payload: JSON.stringify(sensitiveData),
      password: this.encryptionKey,
      separator: '.'
    });
    if (!encryptedData) {
        throw new Error('Failed to encrypt sensitive transaction data');
      }

    const transaction = new Transaction({
      ...transactionData,
      providerRef: encryptedData, // Store encrypted data
      card: undefined, // Don't store card details in plain text
      providerData: [], // Don't store provider data in plain text
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _versions: 1
    });

    await transaction.save();
    return transaction;
  }

  public async verifyTransaction(reference: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const verificationResult = await this.paystackProvider.verifyPayment(reference);
      const transaction = await Transaction.findOne({ reference });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Decrypt existing sensitive data
      const decrypted = await this.systemService.decryptData({
        payload: transaction.providerRef,
        password: this.encryptionKey,
        separator: '.'
      });

      const sensitiveData = decrypted.error ? {} : JSON.parse(decrypted.data);

      // Update and encrypt new sensitive data
      const updatedSensitiveData = {
        ...sensitiveData,
        providerData: [...(sensitiveData.providerData || []), verificationResult]
      };

      const encryptedData = await this.systemService.encryptData({
        payload: JSON.stringify(updatedSensitiveData),
        password: this.encryptionKey,
        separator: '.'
      });

      transaction.status = verificationResult.status;
      transaction.providerRef = encryptedData;
      transaction.updatedAt = new Date().toISOString();
      await transaction.save();

      result.message = "Transaction verified successfully";
      result.data = this.sanitizeTransactionData(transaction);
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  private async sanitizeTransactionData(transaction: ITransactionDoc): Promise<any> {
    const decrypted = await this.systemService.decryptData({
      payload: transaction.providerRef,
      password: this.encryptionKey,
      separator: '.'
    });

      const transactionData = transaction.toObject();
      delete transactionData.providerRef;
  
      if (decrypted.error) {
        delete transactionData.card;
        return transactionData;
      }
  
      const sensitiveData: ISensitiveData = JSON.parse(decrypted.data);
      return {
        ...transactionData,
        card: sensitiveData.card,
        providerRef: sensitiveData.providerRef,
        providerData: sensitiveData.providerData
      };
    }

  private generateReference(userId: ObjectId): string {
    return `TRX-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // ... rest of your existing helper methods (validateTransactionRequest, processPaymentWithRetry, etc.)

  
  private async validateTransactionRequest(
    userId: ObjectId,
    amount: number,
    paymentMethod: IPaymentMethod
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!paymentMethod?.email || !paymentMethod.type) {
      throw new Error("Invalid payment method");
    }
  }



  private async processPaymentWithRetry(
    amount: number,
    paymentMethod: IPaymentMethod,
    idempotencyKey: string
  ): Promise<any> {
    let attempts = 0;
    let lastError;

    while (attempts < this.maxRetries) {
      try {
        let result = await this.paystackProvider.processPayment(
          amount,
          paymentMethod,
          idempotencyKey
        );

        if (!result?.providerRef) {
            throw new Error('Invalid payment provider response');
          }
          
          return result;
      } catch (error) {
        lastError = error;
        attempts++;
        if (attempts < this.maxRetries) {
          await this.delay(Math.pow(2, attempts) * 1000);
        }
      }
    }

    throw lastError;
  }

  
  private async isDuplicateTransaction(idempotencyKey: string): Promise<boolean> {
    const existingTransaction = await Transaction.findOne({
      reference: idempotencyKey,
      status: { $ne: ETransactionStatus.FAILED }
    });
    return !!existingTransaction;
  }



  public async processRefund(
    transactionId: ObjectId,
    reason: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      const decrypted = await this.systemService.decryptData({
        payload: transaction.providerRef,
        password: this.encryptionKey,
        separator: '.'
      });

      if (decrypted.error) {
        throw new Error('Failed to decrypt transaction data');
      }

      const sensitiveData: ISensitiveData = JSON.parse(decrypted.data);

      const refundResult = await this.paystackProvider.processRefund(
        sensitiveData.providerRef,
        transaction.amount,
        reason
      );

      const refundTransaction = await this.recordTransaction({
        type: ETransactionsType.REFUND,
        medium: transaction.medium,
        resource: 'refund',
        entity: 'transaction',
        reference: `REF-${transaction.reference}`,
        currency: transaction.currency,
        providerRef: refundResult.providerRef,
        providerName: 'paystack',
        description: `Refund for transaction ${transaction.reference}`,
        narration: reason,
        amount: transaction.amount,
        unitAmount: transaction.unitAmount,
        fee: refundResult.fee || 0,
        unitFee: (refundResult.fee || 0) * 100,
        status: ETransactionStatus.PENDING,
        channel: transaction.channel,
        slug: `refund-${transaction.slug}`,
        user: transaction.user,
        providerData: [refundResult],
        metadata: [{ originalTransaction: transaction._id }]
      });

      await this.notifyRefund(transaction.user, refundTransaction);

      result.message = "Refund processed successfully";
      result.data = await this.sanitizeTransactionData(refundTransaction);
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  // Add this method to your TransactionService class
public async verifyPaymentMethod(
   data: verifyPaymentDTO
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const { paymentMethod, transactionId } = data;

    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error("Verification transaction not found");
      }

      // Verify card with payment provider
      const verificationResult = await this.paystackProvider.verifyCard(
        paymentMethod,
        transaction.reference,
      );

      // Update transaction with verification result
      const sensitiveData = {
        card: paymentMethod.card,
        providerRef: verificationResult.reference,
        providerData: [verificationResult]
      };

      const encryptedData = await this.systemService.encryptData({
        payload: JSON.stringify(sensitiveData),
        password: this.encryptionKey,
        separator: '.'
      });

      transaction.status = verificationResult.status;
      transaction.providerRef = encryptedData;
      transaction.updatedAt = new Date().toISOString();
      await transaction.save();

      result.message = "Payment method verified successfully";
      result.data = this.sanitizeTransactionData(transaction);
    } catch (error: any) {
      result.error = true;
      result.message = error.message;
      result.code = 500;
    }

    return result;
  }

  private async notifyRefund(userId: ObjectId, transaction: ITransactionDoc): Promise<void> {
    await Promise.all([
      EmailService. sendRefundConfirmation(transaction),
      NotificationService.sendRefundNotification(transaction)
    ]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

export default new TransactionService();
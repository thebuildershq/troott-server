import axios from "axios";
import { ETransactionStatus, ETransactionReason } from "../utils/enums.util";
import { IDebitCard, IPaymentMethod, IUserDoc } from "../utils/interface.util";
import { VerifyCardDTO } from "../dtos/paystack.dto";

class PaystackProvider {
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY as string;
    this.baseUrl = process.env.PAYSTACK_BASEURL as string;
  }

  /**
   * @method processPayment
   * @description Initializes a payment transaction with Paystack
   * @param {number} amount - Transaction amount in base currency (will be converted to kobo)
   * @param {any} paymentMethod - Payment method details including email and type
   * @param {string} idempotencyKey - Unique key to prevent duplicate transactions
   * @returns {Promise<any>} Transaction initialization details including authorization URL
   * @throws {Error} When payment initialization fails
   */
  public async processPayment(
    amount: number,
    paymentMethod: any,
    idempotencyKey: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: amount * 100, // Convert to kobo
          email: paymentMethod.email,
          reference: idempotencyKey,
          callback_url: process.env.PAYSTACK_CALLBACK_URL,
          channels: ["card", "bank", "ussd", "qr", "mobile_money"],
          metadata: {
            custom_fields: [
              {
                display_name: "Payment Method",
                variable_name: "payment_method",
                value: paymentMethod.type,
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        status: ETransactionStatus.PENDING,
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
        providerRef: response.data.data.reference,
      };
    } catch (error: any) {
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  /**
   * @method verifyPayment
   * @description Verifies a payment transaction with Paystack
   * @param {string} reference - Transaction reference to verify
   * @returns {Promise<any>} Verified transaction details
   * @throws {Error} When payment verification fails
   */
  public async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const transaction = response.data.data;
      return {
        status: this.mapPaystackStatus(transaction.status),
        amount: transaction.amount / 100, // Convert from kobo
        currency: transaction.currency,
        providerRef: transaction.reference,
        card: this.mapCardData(transaction.authorization),
        metadata: transaction.metadata,
        channel: transaction.channel,
        providerName: "paystack",
      };
    } catch (error: any) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * @method processRefund
   * @description Processes a refund for a transaction
   * @param {string} reference - Transaction reference to refund
   * @param {number} amount - Amount to refund in base currency
   * @param {string} reason - Reason for the refund
   * @returns {Promise<any>} Refund transaction details
   * @throws {Error} When refund processing fails
   */
  public async processRefund(
    reference: string,
    amount: number,
    reason: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/refund`,
        {
          transaction: reference,
          amount: amount * 100, // Convert to kobo
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        status: ETransactionStatus.REFUNDED,
        refundReference: response.data.data.reference,
        amount: response.data.data.amount / 100,
        currency: response.data.data.currency,
        reason: reason,
      };
    } catch (error: any) {
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  /**
   * @method mapPaystackStatus
   * @description Maps Paystack transaction status to internal status enum
   * @param {string} paystackStatus - Status from Paystack API
   * @returns {ETransactionStatus} Mapped internal transaction status
   * @private
   */
  private mapPaystackStatus(paystackStatus: string): ETransactionStatus {
    const statusMap: { [key: string]: ETransactionStatus } = {
      success: ETransactionStatus.SUCCESSFUL,
      failed: ETransactionStatus.FAILED,
      pending: ETransactionStatus.PENDING,
      abandoned: ETransactionStatus.EXPIRED,
      reversed: ETransactionStatus.REFUNDED,
    };

    return statusMap[paystackStatus] || ETransactionStatus.DEFAULT;
  }

  /**
   * @method mapCardData
   * @description Maps Paystack card authorization data to internal card interface
   * @param {any} authorization - Card authorization data from Paystack
   * @returns {IDebitCard} Mapped card data
   * @private
   */
  private mapCardData(authorization: any): IDebitCard {
    return {
      authCode: authorization.authorization_code,
      cardBin: authorization.bin,
      cardLast: authorization.last4,
      expiryMonth: authorization.exp_month,
      expiryYear: authorization.exp_year,
      cardPan: "", // For security, we don't store full PAN
      token: authorization.authorization_code,
      provider: "paystack",
    };
  }

  /**
   * @method getTransactionFee
   * @description Calculates transaction fee for a given amount
   * @param {number} amount - Transaction amount in base currency
   * @returns {Promise<number>} Calculated transaction fee
   * @throws {Error} When fee calculation fails
   */
  public async getTransactionFee(amount: number): Promise<number> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/calculate_fee`,
        {
          params: { amount: amount * 100 },
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data.fee / 100; // Convert from kobo
    } catch (error: any) {
      throw new Error(`Fee calculation failed: ${error.message}`);
    }
  }

  /**
   * @method validateCardBIN
   * @description Validates a card's BIN (Bank Identification Number)
   * @param {string} cardBIN - First 6 digits of the card number
   * @returns {Promise<any>} Card BIN validation details
   * @throws {Error} When BIN validation fails
   */
  public async validateCardBIN(cardBIN: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/decision/bin/${cardBIN}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(`Card BIN validation failed: ${error.message}`);
    }
  }

  /**
   * @method verifyCard
   * @description Verifies a card by making a minimal authorization request
   * @param {IDebitCard} card - Card details to verify
   * @param {string} reference - Transaction reference
   * @returns {Promise<any>} Card verification result
   */
  public async verifyCard(
    payment: IPaymentMethod,
    reference: string
  ): Promise<any> {
    try {
      // Initiate a minimal amount charge to verify card
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: 50, // Minimal amount in kobo (50 kobo = 0.50 NGN)
          email: payment.email,
          reference: `verify_${reference}`,
          card: {
            number: payment.card?.cardPan,
            cvv:payment.card?.cardBin,
            expiry_month:payment.card?.expiryMonth,
            expiry_year:payment.card?.expiryYear,
          },
          metadata: {
            custom_fields: [
              {
                display_name: "Verification",
                variable_name: "verification_type",
                value: "card_verification",
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Immediately void the verification transaction
      await this.voidTransaction(response.data.data.reference);

      return {
        status: ETransactionStatus.SUCCESSFUL,
        reference: response.data.data.reference,
        authorization: response.data.data.authorization,
        card: this.mapCardData(response.data.data.authorization),
      };
    } catch (error: any) {
      throw new Error(`Card verification failed: ${error.message}`);
    }
  }

  /**
   * @method voidTransaction
   * @description Voids a verification transaction
   * @param {string} reference - Transaction reference to void
   * @private
   */
  private async voidTransaction(reference: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/transaction/void`,
        { reference },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      console.error(
        `Failed to void verification transaction: ${error.message}`
      );
    }
  }
}

export default PaystackProvider;

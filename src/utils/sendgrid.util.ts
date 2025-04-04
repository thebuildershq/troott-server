import sgMail from "@sendgrid/mail";
import {
  INodemailerTransport,
  ISgMessageOptions,
  ISgTransportOptions,
} from "../dtos/sendgrid.dto";
import { IResult } from "./interface.util";


class SendgridTransport implements INodemailerTransport {
  private MAX_RETRIES = 3;

  constructor() {}

  /**
   * Send a single email using SendGrid.
   * @param options SendGrid API authentication
   * @param data Email message details
   * @returns Promise<void>
   */
  public async send(
    options: ISgTransportOptions,
    data: ISgMessageOptions
  ): Promise<void> {
    this.validateEmailOptions(options, data);
    sgMail.setApiKey(options.auth.apiKey);

    await this.sendWithRetry(data);
  }

  /**
   * Send multiple emails in bulk.
   * @param options SendGrid API authentication
   * @param messages Array of email message details
   * @returns Promise<IResult>
   */
  public async sendBulk(
    options: ISgTransportOptions,
    messages: ISgMessageOptions[]
  ): Promise<void> {
    if (!options?.auth?.apiKey) {
      throw new Error("SendGrid API key is required.");
    }

    if (!messages.length) {
      throw new Error("No messages provided for bulk sending.");
    }

    sgMail.setApiKey(options.auth.apiKey);

    await sgMail.send(messages);
  }

  /**
   * Validate email options before sending.
   * @param options SendGrid API authentication
   * @param data Email message details
   */
  private validateEmailOptions(
    options: ISgTransportOptions,
    data: ISgMessageOptions
  ) {
    if (!options?.auth?.apiKey)
      throw new Error("SendGrid API key is required.");
    if (!data?.to || !data?.from || !data?.subject)
      throw new Error("Email message details are required.");
  }

  /**
   * Retry email sending up to MAX_RETRIES in case of failure.
   * @param data Email message details
   * @returns SendGrid API response
   */
  private async sendWithRetry(data: ISgMessageOptions): Promise<any> {
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        
        const response = await sgMail.send(data);
        return this.formatResponse(response);

      } catch (error) {
        console.warn(
          `Email send failed. Attempt ${i + 1}/${this.MAX_RETRIES}`,
          error
        );
        if (i === this.MAX_RETRIES - 1) throw error;
      }
    }
  }

  /**
   * Format SendGrid response for better debugging and tracking.
   * @param response SendGrid response object
   */
  private formatResponse(response: any): IResult {
   
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    
    if (response && response[0]) {
        result.code = response[0]?.statusCode || 500;
        result.message = response[0]?.body || "Unknown response";
        result.data = response[0]?.headers || {};
      } else {
        result.error = true;
        result.message = "No response data received";
        result.code = 500;
      }
    
      return result;
  }
}

export default new SendgridTransport();

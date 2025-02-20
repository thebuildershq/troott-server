import sgMail from "@sendgrid/mail";
import { IResult } from "../utils/interface.util";
import appRootPath from "app-root-path";


const BASE_FOLDER: string = `${appRootPath.path}/src`;
class EmailService {
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY as string;

    if (!apiKey) {
      throw new Error("SendGrid API Key must be configured.");
    }

    sgMail.setApiKey(apiKey);

    this.fromEmail = process.env.SENDGRID_FROM_EMAIL as string;
    this.fromName = process.env.SENDGRID_FROM_NAME as string;
  }

  /**
   * @name sendEmail
   * @description Sends an email using SendGrid
   * @param recipient - Recipient email address
   * @param subject - Email subject
   * @param text - Plain text content
   * @param html - HTML content
   * @returns {Promise<IResult>}
   */
  public async sendEmail(
    recipient: string,
    subject: string,
    text: string,
    html: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const msg = {
        to: recipient,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        text,
        html,
      };

      const response = await sgMail.send(msg);

      result.message = `Email sent successfully to ${recipient}`;
      result.data = response;
      return result;
    } catch (error) {
      console.error("Failed to send email:", error);
      result.error = true;
      result.message = "Failed to send email.";
      result.code = 500;
      return result;
    }
  }

  /**
   * @name sendPasswordForgotEmail
   * @description Sends a password forgot email
   * @param recipient - Recipient email address
   * @param resetUrl - Password reset URL
   * @returns {Promise<IResult>}
   */
  public async sendPasswordForgotEmail(
    recipient: string,
    resetUrl: string
  ): Promise<IResult> {
    const subject = "Forgot Password Request";
    const text = `You requested a password reset. Click the link below to reset your password: ${resetUrl}`;
    const html = `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    return await this.sendEmail(recipient, subject, text, html);
  }

  /**
   * @name sendPasswordResetEmail
   * @description Sends a password reset email
   * @param recipient - Recipient email address
   * @param resetUrl - Password reset URL
   * @returns {Promise<IResult>}
   */
  public async sendPasswordResetEmail(
    recipient: string,
    resetUrl: string
  ): Promise<IResult> {
    const subject = "Password Reset Request";
    const text = `You requested a password reset. Click the link below to reset your password: ${resetUrl}`;
    const html = `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    return await this.sendEmail(recipient, subject, text, html);
  }

  /**
   * @name validateEmail
   * @description Validates an email address format
   * @param email - Email address to validate
   * @returns {boolean}
   */
  public validateEmail(email: string): boolean {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }
}

export default new EmailService();
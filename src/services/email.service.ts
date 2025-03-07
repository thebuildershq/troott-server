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
   * @name sendVerificationCodeEmail
   * @description Sends a verification code email
   * @param recipient - Recipient email address
   * @param verificationCode - Verification code
   * @returns {Promise<IResult>}
   */
  public async sendVerificationCodeEmail(
    recipient: string,
    firstName: string,
    verificationCode: string    
  ): Promise<IResult> {
    const subject = "Your Verification Code";
    const text = `Hi ${firstName}, Your verification code is: ${verificationCode}`;
    const html = `
      <p>Hi ${firstName},</p>
      <p>Your verification code is:</p>
      <h1>${verificationCode}</h1>
      <p>Please enter this code on the app to verify your email address.</p>
    `;

    return await this.sendEmail(recipient, subject, text, html);
  }

  /**
   * @name sendPasswordForgotEmail
   * @description Sends a password forgot email
   * @param recipient - Recipient email address
   * @param resetCode - Password reset code
   * @returns {Promise<IResult>}
   */
  public async sendPasswordForgotEmail(
    recipient: string,
    firstName: string,
    resetCode: string
  ): Promise<IResult> {
    const subject = "Forgot Password Request";
    const text = `Your password reset code is: ${resetCode}`;
    const html = `
      <p>Hi ${firstName},</p>
      <p>Your password reset code is:</p>
      <h1>${resetCode}</h1>
      <p>Please enter this code on the app to reset your password.</p>
    `;

    return await this.sendEmail(recipient, subject, text, html);
  }

  /**
   * @name sendPasswordResetEmail
   * @description Sends a password reset email
   * @param recipient - Recipient email address
   * @param resetCode - Password reset code
   * @returns {Promise<IResult>}
   */
  public async sendPasswordResetEmail(
    recipient: string,
    resetCode: string
  ): Promise<IResult> {
    const subject = "Password Reset Request";
    const text = `Your password reset code is: ${resetCode}`;
    const html = `
      <p>Your password reset code is:</p>
      <h1>${resetCode}</h1>
      <p>Please enter this code on the app to reset your password.</p>
    `;

    return await this.sendEmail(recipient, subject, text, html);
  }

  /**
   * @name sendWelcomeEmail
   * @description Sends a welcome email to the new user
   * @param recipient - Recipient email address
   * @param firstName - First name of the recipient
   * @returns {Promise<IResult>}
   */
  public async sendWelcomeEmail(
    recipient: string,
    firstName: string
  ): Promise<IResult> {
    const subject = "Welcome to Our Service!";
    const text = `Hi ${firstName},\n\nWelcome to our service! We're excited to have you on board.`;
    const html = `
      <p>Hi ${firstName},</p>
      <p>Welcome to our service! We're excited to have you on board.</p>
      <p>Feel free to explore and let us know if you have any questions.</p>
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


/***
 * send creator verification status in review
 * send creator verification status accepted
 * send creator verification status rejection
 * 
 * send admin login invite (email, password)
 * 
 * send listener welcome email
 * send creator welcome email
 * send admin welcome email
 * 
 * send listener | creator | admin password reset email
 * 
 * send new sermon notification to listeners
 * send new playlist notification to listeners
 * 
 * 
 */
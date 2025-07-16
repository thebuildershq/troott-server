import { renderFile } from "ejs";
import nodemailer from "nodemailer";
import appRootPath from "app-root-path";
import sgMail from "@sendgrid/mail";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

import transporter from "../utils/sendgrid.util";
import {
  SendEmailDTO,
  SendgridEmailDataDTO,
  SendOtpDTO,
} from "../dtos/email.dto";
import { EmailService, EmailTemplate, OtpType } from "../utils/enums.util";
import {
  EmailConfig,
  IEmailJob,
  IResult,
  ISermonDoc,
  IUserDoc,
} from "../utils/interface.util";
import { EMAIL_CONFIG } from "../config/email.config";

const BASE_FOLDER = `${appRootPath.path}/src`;

class AppEmailService {
  private config: EmailConfig;
  private mailersend?: MailerSend;
  private smtpTransport?: nodemailer.Transporter;

  constructor() {
    this.config = EMAIL_CONFIG;

    switch (this.config.service) {
      case EmailService.MAILSEND:
        this.mailersend = new MailerSend({ apiKey: this.config.apiKey! });
        break;

      case EmailService.SENDGRID:
        sgMail.setApiKey(this.config.apiKey!);
        break;

      case EmailService.SMTP:
        this.smtpTransport = nodemailer.createTransport({
          host: this.config.smtpHost!,
          port: this.config.smtpPort!,
          secure: false,
          auth: {
            user: this.config.smtpUser!,
            pass: this.config.smtpPass!,
          },
        });
        break;
    }
  }

  /**
   * Dispatch email using the configured service
   * @param data Email data to be sent
   * @param driver Email service driver
   */
  private async dispatch(data: IEmailJob): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const templatePath = `${BASE_FOLDER}/views/emails/authentication/${data.template}.ejs`;

      const html = await new Promise<string>((resolve, reject) => {
        renderFile(templatePath, { ...data.payload, user: data.user, code: data.code, subject: data.subject }, {}, (err, str) => {
          if (err || !str)
            return reject(err || new Error("Failed to render template"));
          resolve(str);
        });
      });

      const sendFnMap: Partial<Record<EmailService, () => Promise<void>>> = {
        [EmailService.SENDGRID]: async () => {
          await transporter.send(
            { auth: { apiKey: this.config.apiKey! } },
            {
              to: data.user.email,
              from: `${this.config.fromName} <${this.config.fromEmail}>`,
              subject: data.subject,
              text: "email",
              html,
            }
          );
        },

        [EmailService.MAILSEND]: async () => {
          const params = new EmailParams()
            .setFrom(new Sender(this.config.fromEmail!, this.config.fromName!))
            .setTo([new Recipient(data.user.email)])
            .setReplyTo(new Sender(this.config.replyTo as string))
            .setSubject(data.subject)
            .setHtml(html);

          await this.mailersend!.email.send(params);
        },

        [EmailService.SMTP]: async () => {
          await this.smtpTransport!.sendMail({
            from: `${this.config.fromName} <${this.config.fromEmail}>`,
            to: data.user.email,
            subject: data.subject,
            html,
          });
        },
      };

      const sendFn = sendFnMap[this.config.service];
      if (!sendFn)
        throw new Error(`Email driver "${this.config.service}" not supported`);
      await sendFn();

      result.message = `Email sent to ${data.user.email}`;
      result.data = { template: data.template };
    } catch (error) {
      console.error("Dispatch email error:", error);
      result.error = true;
      result.message = "Failed to send email";
      result.code = 500;
      result.data = {
        error: error instanceof Error ? error.message : String(error),
      };
    }

    return result;
  }

  /**
   * Send email using the specified driver and user data
   * @param config Configuration for sending email
   * @returns Result of the email sending operation
   */
  public async sendEmail(config: SendEmailDTO): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const { driver, user, options, code, metadata, template } = config;
      const _template = template || EmailTemplate.GENERIC;
      const fromName = this.config.fromName || process.env.EMAIL_FROM_NAME!;
      const subject = options?.subject || "Troott Notification";
      const salute = options?.salute || "Hi there";
      const url = options?.buttonUrl || "";
      const buttonText = options?.buttonText || "Take Action";

      const emailContent: IEmailJob = {
        user,
        subject: subject,
        driver: driver,
        template: _template,
        code: code,
        metadata,
        payload: {
          email: user.email,
          fromName: fromName,
          emailTitle: subject,
          emailSalute: salute,
          preheaderText: subject.toLowerCase(),
          bodyOne: options?.bodyOne,
          bodyTwo: options?.bodyTwo,
          bodyThree: options?.bodyThree,
          buttonText,
          buttonUrl: url,
        },
        options,
      };

      await this.dispatch(emailContent);
      result.message = `Email sent successfully to ${user.email}`;
      result.data = emailContent;
    } catch (error) {
      console.error("Error sending email:", error);
      result.error = true;
      result.message = "Failed to send email.";
      result.code = 500;
      result.data = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    return result;
  }

  /**
   * @name sendOTPEmail
   * @description Sends an OTP email to a user with dynamic content and template
   * based on the specified OTP type. This method handles formatting subject, body,
   * and selecting the appropriate email template.
   *
   * @param {SendOtpDTO} config - Email configuration containing the user, code, and otpType
   * @returns {Promise<IResult>} Result indicating success or failure of the email dispatch
   *
   * @example
   * await emailService.sendOTPEmail({
   *   user,
   *   code: 123456,
   *   otpType: OtpType.REGISTER
   * });
   */
  async sendOTPEmail(config: SendOtpDTO): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const { user, code, otpType } = config;
      const subject = this.switchOtpSubject(otpType);

      const template = this.switchOtpTemplate(otpType);
      const { salute, bodyOne, bodyTwo, bodyThree, buttonText, buttonUrl } =
        this.switchOtpContent(otpType, user);

      const response = await this.sendEmail({
        driver: this.config.service,
        user,
        code: code.toString(),
        template,
        options: {
          subject,
          salute,
          bodyOne,
          bodyTwo,
          bodyThree,
          buttonText,
          buttonUrl,
          otpType,
        },
      });

      return response;
    } catch (error) {
      console.error("Error in sendOtpVerification:", error);
      result.error = true;
      result.message = "Failed to send OTP email.";
      result.code = 500;
      result.data = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
      return result;
    }
  }

  /**
   * @name switchOtpSubject
   * @description Returns the email subject line based on the OTP type.
   *
   * @param {OtpType} type - Type of OTP (e.g. REGISTER, LOGIN)
   * @returns {string} - Corresponding subject text for the email
   *
   * @example
   * const subject = switchOtpSubject(OtpType.LOGIN); // "Verify Your Login"
   */
  private switchOtpSubject(type: OtpType): string {
    switch (type) {
      case OtpType.REGISTER:
        return "Verify Your Account";
      case OtpType.LOGIN:
        return "Verify Your Login";
      case OtpType.PASSWORD_RESET:
        return "Reset Your Password";
      case OtpType.CHANGEPASSWORD:
        return "Change Password Code";
      case OtpType.VERIFY:
        return "Verify Your Troott Account";
      default:
        return "Verify Account";
    }
  }

  /**
   * @name switchOtpTemplate
   * @description Determines which email template to use for a given OTP type.
   *
   * @param {OtpType} type - Type of OTP action being performed
   * @returns {EmailTemplate} - Enum key of the correct email template
   *
   * @example
   * const template = switchOtpTemplate(OtpType.PASSWORD_RESET); // RESET_PASSWORD_EMAIL
   */
  private switchOtpTemplate(type: OtpType): EmailTemplate {
    switch (type) {
      case OtpType.REGISTER:
      case OtpType.VERIFY:
        return EmailTemplate.VERIFY_EMAIL;

      case OtpType.LOGIN:
        return EmailTemplate.GENERIC;

      case OtpType.PASSWORD_RESET:
        return EmailTemplate.PASSWORD_RESET;

      case OtpType.CHANGEPASSWORD:
        return EmailTemplate.PASSWORD_CHANGED;

      default:
        return EmailTemplate.VERIFY_EMAIL;
    }
  }

  /**
   * @name switchOtpContent
   * @description Returns the email body text, salute, button label, and redirect URL
   * specific to the OTP type. This supports personalized and contextual email content.
   *
   * @param {OtpType} type - The type of OTP being handled
   * @param {IUserDoc} user - User document for personalizing content
   * @returns {{
   *   salute: string;
   *   bodyOne: string;
   *   bodyTwo: string;
   *   bodyThree: string;
   *   buttonText: string;
   *   buttonUrl: string;
   * }} - Content values for rendering the email template
   *
   * @example
   * const content = switchOtpContent(OtpType.REGISTER, user);
   * const { salute, bodyOne, buttonText } = content;
   */
  private switchOtpContent(type: OtpType, user: IUserDoc) {
    const defaultUrl = `${this.config.clientUrl}/verify`;

    switch (type) {
      case OtpType.REGISTER:
        return {
          salute: `${user.firstName}, let's verify your account`,
          bodyOne: `Welcome to Troott! Please verify your account.`,
          bodyTwo: `Use the OTP below to activate your profile.`,
          bodyThree: `This code will expire in 15 minutes.`,
          buttonText: "Verify Account",
          buttonUrl: defaultUrl,
        };

      case OtpType.LOGIN:
        return {
          salute: `Hi ${user.firstName},`,
          bodyOne: `You're trying to log in to your Troott account.`,
          bodyTwo: `Use the OTP code below to complete login.`,
          bodyThree: `If this wasn’t you, please ignore this email.`,
          buttonText: "Verify Login",
          buttonUrl: `${this.config.clientUrl}/login`,
        };

      case OtpType.PASSWORD_RESET:
        return {
          salute: `Hi ${user.firstName},`,
          bodyOne: `You've requested to reset your password.`,
          bodyTwo: `Use the OTP code below to proceed.`,
          bodyThree: `If you didn't request this, please ignore.`,
          buttonText: "Reset Password",
          buttonUrl: `${this.config.clientUrl}/reset-password`,
        };

      case OtpType.CHANGEPASSWORD:
        return {
          salute: `Hi ${user.firstName},`,
          bodyOne: `You're changing your Troott password.`,
          bodyTwo: `Enter the OTP code below to confirm the change.`,
          bodyThree: `If this wasn’t you, contact support.`,
          buttonText: "Change Password",
          buttonUrl: `${this.config.clientUrl}/change-password`,
        };

      default:
        return {
          salute: `${user.firstName}, let's verify your account`,
          bodyOne: `Please use the OTP below to verify your action.`,
          bodyTwo: `The OTP is valid for 15 minutes.`,
          bodyThree: ``,
          buttonText: "Verify Now",
          buttonUrl: defaultUrl,
        };
    }
  }

  /**
   * Send a welcome email to a user
   * @param user User document
   */
  async sendUserWelcomeEmail(user: IUserDoc) {
    return this.sendEmail({
      driver: this.config.service,
      user,
      template: EmailTemplate.WELCOME,
      options: {
        subject: `Welcome to Troott, ${user.firstName}!`,
        bodyOne: `We're glad to have you onboard.`,
        bodyTwo: `Explore sermons, join discussions, and grow in your faith.`,
        buttonText: "Go to Dashboard",
        buttonUrl: `${this.config.clientUrl}/dashboard`,
      },
    });
  }

  async sendPreacherWelcomeEmail(user: IUserDoc) {
    return this.sendEmail({
      driver: this.config.service,
      user,
      template: EmailTemplate.WELCOME,
      options: {
        subject: `Welcome Preacher, ${user.firstName}!`,
        bodyOne: `You’ve been onboarded as a preacher on Troott.`,
        bodyTwo: `Start uploading sermons to bless your listeners.`,
        buttonText: "Upload Sermon",
        buttonUrl: `${this.config.clientUrl}/sermons/upload`,
      },
    });
  }

  async sendCreatorWelcomeEmail(user: IUserDoc) {
    return this.sendEmail({
      driver: this.config.service,
      user,
      template: EmailTemplate.WELCOME,
      options: {
        subject: `Welcome Creator!`,
        bodyOne: `You can now manage your organization and host events.`,
        bodyTwo: `Start creating content that inspires.`,
        buttonText: "Manage Your Space",
        buttonUrl: `${this.config.clientUrl}/creator/dashboard`,
      },
    });
  }

  async sendStaffWelcomeEmail(user: IUserDoc) {
    return this.sendEmail({
      driver: this.config.service,
      user,
      template: EmailTemplate.WELCOME,
      options: {
        subject: `Welcome to the Team!`,
        bodyOne: `You’ve been added as a staff member on Troott.`,
        bodyTwo: `Access your dashboard and start supporting the mission.`,
        buttonText: "View Staff Dashboard",
        buttonUrl: `${this.config.clientUrl}/dashboard`,
      },
    });
  }

  async sendPasswordChangeNotificationEmail(user: IUserDoc) {
    return this.sendEmail({
      driver: this.config.service,
      user,
      template: EmailTemplate.PASSWORD_CHANGED,
      options: {
        subject: "Your password has been changed",
        bodyOne: `Hi ${user.firstName},`,
        bodyTwo: `This is a confirmation that your password has been changed.`,
        bodyThree: `If this wasn’t you, please contact support immediately.`,
      },
    });
  }

  async sendPasswordResetNotificationEmail(user: IUserDoc) {
    return this.sendEmail({
      driver: this.config.service,
      user,
      template: EmailTemplate.PASSWORD_RESET,
      options: {
        subject: "Reset your Troott password",
        bodyOne: `Hi ${user.firstName},`,
        bodyTwo: `We received a request to reset your password.`,
        bodyThree: `If this wasn’t you, ignore this email.`,
        buttonText: "Reset Password",
        buttonUrl: `${this.config.clientUrl}/reset-password`,
      },
    });
  }

  async sendSubscriptionConfirmation(user: IUserDoc, plan: any) {
    return this.sendEmail({
      driver: this.config.service,
      user,
      template: EmailTemplate.SUBSCRIPTION_CONFIRMED,
      options: {
        subject: `You’re subscribed to ${plan.name}`,
        bodyOne: `Thank you for subscribing to the ${plan.name} plan.`,
        bodyTwo: `We hope you enjoy your access to exclusive content.`,
      },
    });
  }

  async sendTrialActivation(user: IUserDoc) {
    return this.sendEmail({
      driver: this.config.service,
      user,
      template: EmailTemplate.TRIAL_STARTED,
      options: {
        subject: "Your trial is now active",
        bodyOne: `Hi ${user.firstName},`,
        bodyTwo: `Your free trial has started.`,
        bodyThree: `Explore all features during your trial period.`,
      },
    });
  }

  async sendSermonRecommendations(user: IUserDoc, sermons: ISermonDoc[]) {
    return this.sendEmail({
      driver: this.config.service,
      user,
      template: EmailTemplate.RECOMMENDATION,
      options: {
        subject: "Sermons picked for you",
        bodyOne: `Hi ${user.firstName},`,
        bodyTwo: `We’ve selected some sermons you may like.`,
        buttonText: "Listen now",
        buttonUrl: `${this.config.clientUrl}/sermons`,
      },
    });
  }
}

const emailService = new AppEmailService();
export default emailService;

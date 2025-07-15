import { renderFile } from "ejs";
import nodemailer from "nodemailer";
import appRootPath from "app-root-path";
import { SendEmailDTO, SendgridEmailDataDTO } from "../dtos/email.dto";
import sgMail from "@sendgrid/mail";
import transporter from "../utils/sendgrid.util";
import { EmailService, EmailTemplate, OtpType } from "../utils/enums.util";
import { EmailConfig, IResult } from "../utils/interface.util";
import { EMAIL_CONFIG } from "../config/email.config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const BASE_FOLDER: string = `${appRootPath.path}/src`;

class OTPService {
  private config: EmailConfig;
  private mailersend?: MailerSend;
  private smtpTransport?: nodemailer.Transporter;

  constructor(config: EmailConfig) {
    this.config = config;

    switch (this.config.service) {
      case EmailService.SENDGRID:
        sgMail.setApiKey(this.config.apiKey!);
        break;

      case EmailService.MAILSEND:
        this.mailersend = new MailerSend({ apiKey: this.config.apiKey! });
        break;

      case EmailService.SMTP:
        this.smtpTransport = nodemailer.createTransport({
          host: this.config.smtpHost!,
          port: this.config.smtpPort!,
          secure: false, // or true if using port 465
          auth: {
            user: this.config.smtpUser!,
            pass: this.config.smtpPass!,
          },
        });
        break;
    }
  }

  /**
   * @name sendOTPEmail
   * @description Send OTP email to a user
   * @param { SendEmailDTO } config
   * @returns IResult
   */
  public async sendOTPEmail(config: SendEmailDTO): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const { driver, user, code, options, template } = config;

      // Default values
      let buttonText = options?.buttonText || "Verify";
      const _template = template || EmailTemplate.VERIFY_EMAIL;
      const salute = options?.salute || ", Let's verify your account";
      const url = options?.buttonUrl || "";
      const fromName = this.config.fromName || process.env.EMAIL_FROM_NAME!;

      const bodyOne =
        options?.bodyOne ||
        `We have received your request to make a security-sensitive changes to your troott account.`;
      const bodyTwo =
        options?.bodyTwo ||
        `To ensure the security of your account, we have generated a one-time password (OTP) for verification.`;
      const bodyThree =
        options?.bodyThree || `Note that this OTP expires in 15 minutes.`;

      const title =
        options?.subject ||
        (options?.otpType
          ? this.switchOTPTitle(options.otpType)
          : "Verify Account");

      // Prepare email content
      const emailContent: SendgridEmailDataDTO = {
        email: user.email,
        code: code,
        fromName: fromName,
        template: _template,
        emailSalute: salute,
        emailTitle: title,
        preheaderText: title.toLowerCase(),
        bodyOne: bodyOne,
        bodyTwo: bodyTwo,
        bodyThree: bodyThree,
        buttonText: buttonText,
        buttonUrl: `${url}`,
      };

      await this.sendRenderedEmail(emailContent, driver);
      result.message = `OTP sent successfully to ${emailContent.email}`;
      result.data = emailContent;

    } catch (error) {
      console.log("Error sending OTP email:", error);
      result.error = true;
      result.message = "Failed to send OTP email.";
      result.code = 500;
      result.data = { error: error instanceof Error ? error.message : "Unknown error" };
    }

    return result;
  }

  /**
   * @name switchOTPTitle
   * @description Switch {type} to determine OTP email title
   * @param {OtpTypeType} type
   * @returns {string} string
   */
  private switchOTPTitle(type: OtpType): string {
    let result: string;

    switch (type) {
      case OtpType.REGISTER:
        result = "Verify Your Account";
        break;
      case OtpType.LOGIN:
        result = "Verify Your Email";
        break;
      case OtpType.CHANGEPASSWORD:
        result = "Password Change Code";
        break;
      case OtpType.PASSWORD_RESET:
        result = "Password Reset Code";
        break;
      case OtpType.VERIFY:
        result = "Verify your troott account";
        break;
      default:
        result = "Verify Account";
        break;
    }

    return result;
  }

  /**
   * @name sendEmail
   * @description Send email using the specified driver
   * @param {SendgridEmailDataDTO} data
   * @param {EmailService} driver
   */
  private async sendRenderedEmail(
    data: SendgridEmailDataDTO,
    driver: EmailService
  ): Promise<void> {
    const templatePath = `${BASE_FOLDER}/views/emails/authentication/${data.template}.ejs`;

    const html = await new Promise<string>((resolve, reject) => {
      renderFile(templatePath, data, {}, (err, html) => {
        if (err || !html) return reject(err);
        resolve(html);
      });
    });

    const sendersMap: Map<EmailService, () => Promise<void>> = new Map([
      [
        EmailService.SENDGRID,
        async () => {
          if (!this.config.apiKey) throw new Error("SendGrid not initialized.");

          const mailData = {
            to: data.email,
            from: `${data.fromName || process.env.EMAIL_FROM_NAME} <${
              process.env.EMAIL_FROM_EMAIL
            }>`,
            subject: data.emailTitle,
            text: "email",
            html: html!,
          };

          await transporter.send(
            { auth: { apiKey: this.config.apiKey! } },
            mailData
          );
        },
      ],
      [
        EmailService.MAILSEND,
        async () => {
          if (!this.mailersend) throw new Error("MailerSend not initialized.");

          const emailParams = new EmailParams()
            .setFrom(new Sender(this.config.fromEmail as string, this.config.fromName as string))
            .setTo([new Recipient(data.email)])
            .setReplyTo(new Sender(this.config.replyTo as string))
            .setSubject(data.emailTitle)
            .setHtml(html!);

            console.log("FROM EMAIL:", this.config.fromEmail, this.config.fromName  );
            console.log("TO:", data.email);


          await this.mailersend.email.send(emailParams);
        },
      ],
      [
        EmailService.SMTP,
        async () => {
          if (!this.smtpTransport)
            throw new Error("SMTP transporter not initialized.");

          await this.smtpTransport.sendMail({
            from: `${this.config.fromName} <${this.config.fromEmail}>`,
            to: data.email,
            subject: data.emailTitle,
            html: html!,
          });
        },
      ],
    ]);

    const sendFn = sendersMap.get(driver);
    if (!sendFn) throw new Error("Unsupported email driver.");

    await sendFn();
  }
}

const otpService = new OTPService(EMAIL_CONFIG);
export default otpService;

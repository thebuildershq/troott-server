import { EmailService, ENVType } from "../utils/enums.util";
import { EmailConfig } from "../utils/interface.util";


let config: EmailConfig;

switch (process.env.NODE_ENV) {
  case ENVType.PRODUCTION:
    config = {
      service: EmailService.MAILSEND,
      fromEmail: process.env.MAIL_FROM_EMAIL!,
      fromName: process.env.MAIL_FROM_NAME!,
      replyTo: process.env.MAIL_REPLY_TO,
      apiKey: process.env.MAILSEND_API_KEY!,
      templateId: process.env.MAILSEND_TEMPLATE_ID,
      sendingDomain: process.env.EMAIL_DOMAIN,
      
      isTestMode: false,
    };
    break;

  case ENVType.STAGING:
    config = {
      service: EmailService.SENDGRID,
      fromEmail: process.env.MAIL_FROM_EMAIL!,
      fromName: process.env.MAIL_FROM_NAME!,
      replyTo: process.env.MAIL_REPLY_TO,
      apiKey: process.env.SENDGRID_API_KEY!,
      templateId: process.env.SENDGRID_TEMPLATE_ID,
      isTestMode: true,
    };
    break;

  case ENVType.DEVELOPMENT:
    config = {
      service: EmailService.SMTP,
      fromEmail: process.env.MAIL_FROM_EMAIL!,
      fromName: process.env.MAIL_FROM_NAME!,
      replyTo: process.env.MAIL_REPLY_TO,
      smtpHost: process.env.SMTP_HOST!,
      smtpPort: Number(process.env.SMTP_PORT!),
      smtpUser: process.env.SMTP_USER!,
      smtpPass: process.env.SMTP_PASS!,
      isTestMode: true,
    };
    break;

  default:
    throw new Error("Invalid NODE_ENV. Email config not set.");
}

export const EMAIL_CONFIG = config;

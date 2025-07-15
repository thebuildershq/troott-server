import { EmailService, ENVType } from "../utils/enums.util";
import { EmailConfig } from "../utils/interface.util";

export function getEmailConfig(): EmailConfig {
  const env = process.env.NODE_ENV;

  if (env === ENVType.PRODUCTION) {
    return {
      service: EmailService.MAILSEND,
      fromEmail: process.env.MAIL_FROM_EMAIL!,
      fromName: process.env.MAIL_FROM_NAME!,
      replyTo: process.env.MAIL_REPLY_TO,
      apiKey: process.env.MAILSEND_API_KEY!,
      templateId: process.env.MAILSEND_TEMPLATE_ID,
      sendingDomain: process.env.EMAIL_DOMAIN,
      clientUrl: process.env.CLIENT_APP_URL as string,
      isTestMode: false,
    };
  }

  if (env === ENVType.STAGING) {
    return {
      service: EmailService.MAILSEND,
      fromEmail: process.env.MAIL_FROM_EMAIL!,
      fromName: process.env.MAIL_FROM_NAME!,
      replyTo: process.env.MAIL_REPLY_TO,
      apiKey: process.env.MAILERSEND_STAGING_API_KEY!,
      templateId: process.env.MAILSEND_TEMPLATE_ID,
      sendingDomain: process.env.MAILERSEND_STAGING_DOMAIN,
      clientUrl: process.env.CLIENT_STAGING_URL as string,
      isTestMode: false,
    };
  }

  if (env === ENVType.DEVELOPMENT) {
    return {
      service: EmailService.MAILSEND,
      fromEmail: process.env.EMAIL_FROM_EMAIL!,
      fromName: process.env.EMAIL_FROM_NAME as string,
      replyTo: process.env.EMAIL_REPLY_TO as string,
      apiKey: process.env.MAILERSEND_STAGING_API_KEY as string,
      templateId: process.env.MAILSEND_TEMPLATE_ID,
      sendingDomain: process.env.MAILERSEND_STAGING_DOMAIN,
      clientUrl: process.env.CLIENT_LOCAL_URL as string,
      isTestMode: false,
    };
  }
  
  throw new Error("Invalid NODE_ENV. Email config not set.");
}

export const EMAIL_CONFIG = getEmailConfig();

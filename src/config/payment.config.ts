import { ENVType, PaymentProviders } from "../utils/enums.util";
import { PaymentConfig } from "../utils/interface.util";

let config: PaymentConfig;

switch (process.env.APP_ENV) {
  case ENVType.PRODUCTION:
    config = {
      provider: PaymentProviders.PAYSTACK,
      secretKey: process.env.PAYSTACK_LIVE_SECRET_KEY!,
      publicKey: process.env.PAYSTACK_LIVE_PUBLIC_KEY!,
      webhookSecret: process.env.PAYSTACK_LIVE_WEBHOOK_SECRET,
      isTestMode: false,
    };
    break;

  case ENVType.STAGING:
    config = {
      provider: PaymentProviders.PAYSTACK,
      secretKey: process.env.PAYSTACK_TEST_SECRET_KEY!,
      publicKey: process.env.PAYSTACK_TEST_PUBLIC_KEY!,
      webhookSecret: process.env.PAYSTACK_TEST_WEBHOOK_SECRET,
      isTestMode: true,
    };
    break;

  case ENVType.DEVELOPMENT:
    config = {
      provider: PaymentProviders.PAYSTACK,
      secretKey: process.env.PAYSTACK_TEST_SECRET_KEY!,
      publicKey: process.env.PAYSTACK_TEST_PUBLIC_KEY!,
      webhookSecret: process.env.PAYSTACK_TEST_WEBHOOK_SECRET,
      isTestMode: true,
    };
    break;

  default:
    throw new Error("Invalid APP_ENV. Payment config not set.");
}

export const PAYMENT_CONFIG = config;

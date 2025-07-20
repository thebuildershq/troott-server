import { ENVType } from "../utils/enums.util";
import { FrontendURLConfig } from "../utils/interface.util";

let config: FrontendURLConfig;

switch (process.env.APP_ENV) {
  case ENVType.PRODUCTION:
    config = {
      baseUrl: process.env.CLIENT_APP_URL!,
      apiUrl: process.env.CLIENT_API_URL!,
      paymentRedirectUrl: process.env.CLIENT_PAYMENT_REDIRECT_URL!,
      dashboardUrl: process.env.CLIENT_DASHBOARD_URL!,
    };
    break;

  case ENVType.STAGING:
    config = {
      baseUrl: process.env.CLIENT_STAGING_BASE_URL!,
      apiUrl: process.env.CLIENT_STAGING_API_URL!,
      paymentRedirectUrl: process.env.CLIENT_STAGING_PAYMENT_REDIRECT_URL!,
      dashboardUrl: process.env.CLIENT_STAGING_DASHBOARD_URL!,
    };
    break;

  case ENVType.DEVELOPMENT:
    config = {
      baseUrl: process.env.CLIENT_LOCAL_URL!,
      apiUrl: process.env.CLIENT_LOCAL_API_URL!,
      paymentRedirectUrl: process.env.CLIENT_LOCAL_PAYMENT_REDIRECT_URL!,
      dashboardUrl: process.env.CLIENT_LOCAL_DASHBOARD_URL!,
    };
    break;

  default:
    throw new Error("Invalid APP_ENV. Frontend URL config not set.");
}

export const FRONTEND_URL_CONFIG = config;

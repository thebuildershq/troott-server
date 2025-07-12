import { ENVType, OAuthProvider } from "../utils/enums.util";
import { OAuthConfig, OAuthProvidersConfig } from "../utils/interface.util";

let googleConfig: OAuthConfig;
let githubConfig: OAuthConfig;

switch (process.env.APP_ENV) {
  case ENVType.PRODUCTION:
    googleConfig = {
      provider: OAuthProvider.GOOGLE,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
    };

    githubConfig = {
      provider: OAuthProvider.GITHUB,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectUri: process.env.GITHUB_REDIRECT_URI!,
    };
    break;

  case ENVType.STAGING:
  case ENVType.DEVELOPMENT:
  default:
    googleConfig = {
      provider: OAuthProvider.GOOGLE,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
    };

    githubConfig = {
      provider: OAuthProvider.GITHUB,
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectUri: process.env.GITHUB_REDIRECT_URI!,
    };
    break;
}

export const OAUTH_CONFIG: OAuthProvidersConfig = {
  google: googleConfig,
  github: githubConfig,
};

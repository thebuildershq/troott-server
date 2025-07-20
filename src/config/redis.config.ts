import { ENVType } from "../utils/enums.util";
import { RedisConfig } from "../utils/interface.util";

let config: RedisConfig;

switch (process.env.APP_ENV) {
  case ENVType.PRODUCTION:
    config = {
      family: 0,
      host: process.env.REDIS_HOST_PROD!,
      port: Number(process.env.REDIS_PORT),
      user: process.env.REDIS_USER!,
      password: process.env.REDIS_PASSWORD_PROD!,
      db: Number(process.env.REDIS_DB!),
    };
    break;

  case ENVType.STAGING:
    config = {
      family: 0,
      host: process.env.REDIS_HOST_STAGING!,
      port: Number(process.env.REDIS_PORT),
      user: process.env.REDIS_USER!,
      password: process.env.REDIS_PASSWORD_STAGING!,
      db: Number(process.env.REDIS_DB!),
    };
    break;

  case ENVType.DEVELOPMENT:
    config = {
      host: process.env.REDIS_HOST_DEV!,
      port: Number(process.env.REDIS_PORT),
      user: process.env.REDIS_USER!,
      password: process.env.REDIS_PASSWORD_DEV!,
      db: Number(process.env.REDIS_DB!),
    };
    break;

  default:
    throw new Error("Invalid APP_ENV. Redis config not set.");
}

export const REDIS_CONFIG = config;

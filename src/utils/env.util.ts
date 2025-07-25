import { EENVType } from "./enums.util";

class AppENV {
  constructor() {}

  /**
   * @name isProduction
   * @description Determine if app is in production
   * @returns {boolean} - boolean
   */
  public isProduction(): boolean {
    let result: boolean = false;

    if (process.env.APP_ENV === EENVType.PRODUCTION) {
      result = true;
    }
    return result;
  }


  /**
   * @name isStaging
   * @description Determine if app is in staging
   * @returns {boolean} - boolean
   */
  public isStaging(): boolean {
    let result: boolean = false;

    if (process.env.APP_ENV === EENVType.STAGING) {
      result = true;
    }
    return result;
  }


  /**
   * @name isDevelopment
   * @description Determine if app is in development
   * @returns {boolean} - boolean
   */
  public isDevelopment(): boolean {
    let result: boolean = false;

    if (process.env.APP_ENV === EENVType.DEVELOPMENT) {
      result = true;
    }
    return result;
  }
}

export default new AppENV


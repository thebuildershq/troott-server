import { RegisterDTO } from "../dtos/auth.dto";
import authMapper from "../mappers/auth.mapper";
import User from "../models/User.model";
import { generateRandomCode } from "../utils/helper.util";
import { IResult, IUserDoc } from "../utils/interface.util";
import emailService from "./email.service";
import userService from "./user.service";

const user = new User();
class AuthService {
  constructor() {}

  /**
   * @name validateRegister
   * @param data
   * @returns { IResult } - see IResult
   */
  public async validateRegister(data: RegisterDTO): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };
    const { email, password, firstName, lastName } = data;
    this.validateEmailAndPassword(email, password, firstName, lastName, result);

    return result;
  }

  /**
   * @name validateLogin
   * @param data
   * @returns { IResult } - see IResult
   */
  public async validateLogin(data: RegisterDTO): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    const { email, password } = data;

    const user = await User.findOne({ email }).populate([
      { path: "role", select: "name permissions" },
    ]);

    if (!user) {
      return this.handleInvalidCredentials(result);
    }

    if (user.isLocked && user.lockedUntil) {
      const lockedUntilTimestamp = user.lockedUntil.getTime();
      const nowTimestamp = Date.now();

      if (lockedUntilTimestamp > nowTimestamp) {
        const minutesRemaining = Math.floor(
          (lockedUntilTimestamp - nowTimestamp) / 1000 / 60
        );

        return this.handleAccountLocked(result, minutesRemaining);
      }
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      await this.handleIncorrectPassword(user);
      return this.handleInvalidCredentials(result);
    }

    if (!user.isActivated) {
      return this.handleAccountNotActivated(result);
    }

    await this.resetLoginLimit(user);
    const authToken = await user.getAuthToken();
    const mappedData = await authMapper.mapRegisteredUser(user);
    result.data = { ...mappedData, token: authToken };

    return result;
  }

  /**
   * @name sendVerificationEmail
   * @param data
   * @returns {Promise<IResult>}
   */
  public async sendVerificationEmail(data: RegisterDTO): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };
    const { email } = data;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      result.error = true;
      result.code = 404;
      result.message = "user does not exist, please register";
      result.data = {};
    } else {
      const { activationCode, activationCodeExpire } = this.getActivationCode();
      user.activationCode = activationCode;
      user.activationCodeExpirationDate = activationCodeExpire;
      await user.save();

      await emailService.sendVerificationCodeEmail(
        user.email,
        activationCode,
        user.firstName
      );
      result.message = "Verification email sent successfully";
    }

    return result;
  }

  /**
   * @name verifyActivationCode
   * @param user
   * @param activationCode
   * @returns {Promise<IResult>}
   */
  public async verifyActivationCode(user: IUserDoc, activationCode: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };
    
    if (user.activationCode !== activationCode) {
      result.error = true;
      result.code = 400;
      result.message = "Invalid activation code";
      result.data = {};
    } else if (user.activationCodeExpirationDate && user.activationCodeExpirationDate < new Date()) {
      result.error = true;
      result.code = 400;
      result.message = "Activation code has expired";
      result.data = {};
    } else {
      user.isActivated = true;
      user.activationCode = "";
      user.activationCodeExpirationDate = new Date();
      await user.save();
      result.message = "User activated successfully";
    }

    return result;
  }


  /**
   * @name activateUser
   * @param email
   * @returns {Promise<IResult>}
   */
  public async activateUser(email: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const user = await User.findOne({ email });
    if (!user) {
      result.error = true;
      result.code = 404;
      result.message = "User not found";
      result.data = {};
    } else {
      user.isActivated = true;
      await user.save();
      result.message = "User activated successfully";
    }

    return result;
  }

    /**
   * @name validateEmail
   * @param email
   * @param result
   * @returns result
   */
  private validateEmail(email: string, result: IResult): IResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      result.error = true;
      result.message = "Email is required";
      result.code = 400;
    } else if (!emailRegex.test(email)) {
      result.error = true;
      result.message = "Invalid email format";
      result.code = 400;
    } else {
      result.error = false;
      result.message = "";
      result.code = 200;
    }

    return result;
  }
  

  /**
   * @name validateEmailAndPassword
   * @param email
   * @param password
   * @param result
   * @returns result
   */
  private validateEmailAndPassword(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    result: IResult
  ) {
    if (!email) {
      result.error = true;
      result.message = "email is required";
      result.code = 400;
    } else if (!password) {
      result.error = true;
      result.message = "password is required";
      result.code = 400;
    } else if (!userService.checkEmail(email)) {
      result.error = true;
      result.message = "a valid email is required";
      result.code = 400;
    } else if (!userService.checkPassword(password)) {
      result.error = true;
      result.message =
        "password must contain, 1 uppercase letter, one special character, one number and must be greater than 8 characters";
      result.code = 400;
    } else if (!firstName || !firstName?.trim()) {
      result.error = true;
      result.message = "First name is a required field";
      result.code = 400;
    } else if (!lastName || !lastName?.trim()) {
      result.error = true;
      result.message = "Last name is a required field";
      result.code = 400;
    } else {
      result.error = false;
      result.message = "";
      result.code = 200;
    }

    return result;
  }

  private async handleAccountNotActivated(result: IResult) {
    result.error = true;
    result.message = "Your account is not activated";
    result.code = 400;

    return result;
  }

  private async handleIncorrectPassword(user: IUserDoc) {
    user.loginLimit -= 1;
    await user.save();

    if (user.loginLimit === 0) {
      user.isLocked = true;
      user.lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();
    }
  }

  private async handleAccountLocked(result: IResult, lockedUntil: number) {
    result.error = true;
    result.message = `Your account is locked. Try again in ${lockedUntil}`;
    result.code = 401;

    return result;
  }

  private handleInvalidCredentials(result: IResult) {
    result.error = true;
    result.message = "Invalid Credentials";
    result.code = 401;

    return result;
  }

  private async resetLoginLimit(user: IUserDoc) {
    user.loginLimit = 5;
    user.lockedUntil = null;
    await user.save();
  }

  public getActivationCode() {
    const activationCode = generateRandomCode(6);
    const activationCodeExpire = new Date(Date.now() + 5 * 60 * 1000);
    return { activationCode, activationCodeExpire };
  }

  public async verifyAccount(activationCode: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };
    const user = await User.findOne({
      activationCode,
    });

    if (!user) {
      result.error = true;
      result.code = 404;
      result.message = "User not found";
      result.data = {};
    } else {
      user.isActivated = true;
      user.activationCode = "";
      await user.save();
    }

    return result;
  }
}

export default new AuthService();

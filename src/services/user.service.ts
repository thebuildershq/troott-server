import { Request } from "express";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import { IBulkUser, ILogin, IResult, IUserDoc } from "../utils/interface.util";
import {
  Random,
  UIID,
  arrayIncludes,
  dateToday,
  strIncludesEs6,
} from "@btffamily/pacitude";
import SystemService from "./system.service";
import userRepository from "../repositories/user.repository";
import { EOtpType, EUserType } from "../utils/enums.util";
import {
  LoginDTO,
  MatchEncryptedPasswordDTO,
  RegisterUserDTO,
} from "../dtos/auth.dto";
import { createUserDTO } from "../dtos/user.dto";
import User from "../models/User.model";
import Role from "../models/Role.model";
import { detectPlatform } from "../utils/helper.util";
import PermissionService from "./permission.service";
import listenerService from "./listener.service";
import { IPermissionDTO } from "../dtos/system.dto";
import creatorService from "./creator.service";
import preacherService from "./preacher.service";
import staffService from "./staff.service";
import ErrorResponse from "../utils/error.util";

class UserService {
  public result: IResult;

  constructor() {
    this.result = { error: false, message: "", code: 200, data: {} };
  }

  /**
   * @name validateRegister
   * @description
   * Validates the user registration payload before proceeding with user creation.
   * This method ensures all required fields are present and conform to expected rules.
   * @param {RegisterUserDTO} data - The user registration data transfer object containing the form input.
   * @returns {Promise<IResult>} A result object indicating success or failure with an appropriate message.
   */
  public async validateRegister(data: RegisterUserDTO): Promise<IResult> {
    const allowedUsers = [
      EUserType.LISTENER,
      EUserType.CREATOR,
      EUserType.PREACHER,
    ];

    let result: IResult = { error: false, message: "", code: 200, data: {} };

    if (!data.email) {
      result.error = true;
      result.message = "Email is required";
    } else if (!data.firstName) {
      result.error = true;
      result.message = "First name is required";
    } else if (!data.lastName) {
      result.error = true;
      result.message = "Last name is required";
    } else if (!data.password) {
      result.error = true;
      result.message = "Password is required";
    } else if (!data.userType || !arrayIncludes(allowedUsers, data.userType)) {
      result.error = true;
      result.message = `Invalid user type value. choose from ${allowedUsers.join(
        ","
      )}`;
    } else {
      result.error = false;
      result.message = "";
    }

    return result;
  }

  /**
   * @name validateLogin
   * @param data
   * @returns
   */
  public async validateLogin(data: LoginDTO): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: null };

    const { email, password } = data;

    if (!email) {
      result.error = true;
      result.message = "email is required";
    } else if (!password) {
      result.error = true;
      result.message = "password is required";
    } else {
      const mailCheck = await this.checkEmail(email);

      if (!mailCheck) {
        result.error = true;
        result.message = `a valid email is required`;
      } else {
        result.error = false;
        result.message = ``;
      }
    }

    return result;
  }

  /**
   * @name validatePhoneNumber
   * @param data
   * @returns
   */
  public validatePhoneNumber(data: { phone: string }): boolean {
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let result: boolean = false;

    const { phone } = data;

    const split = phone.substring(0, 3).split("");

    if (
      split[0] === "0" &&
      arrayIncludes(digits, split[1]) &&
      arrayIncludes(digits, split[2])
    ) {
      result = true;
    }

    return result;
  }

  /**
   * @name createUser
   * @param data
   * @returns
   */
  public async createUser(data: createUserDTO): Promise<IUserDoc> {
    const {
      firstName,
      lastName,
      email,
      password,
      userType,
      role,
      permissions,
    } = data;

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create the user object
    let user: IUserDoc = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      userType,
      role,
      permissions,
      passwordType: data.passwordType,
    });

    // Attach role to user based on userType
    await this.attachRole(user, userType);

    // Handle permissions (if no permissions provided, use a service to create default permissions)
    if (!permissions || permissions.length === 0) {
      user = await PermissionService.initiatePermissionData(user);
    } else {
      const permissionPayload: IPermissionDTO = {
        user: user._id.toString(),
        permissions,
        role: user.role,
      };
      const permissionUpdate = await PermissionService.updatePermissions(
        user,
        permissionPayload
      );
      if (permissionUpdate.error) {
        throw new Error(permissionUpdate.message);
      }

      user = permissionUpdate.data as IUserDoc;
    }

    if (user.userType === EUserType.LISTENER) {
      const listenerProfile = await listenerService.createListener({
        user: user,
        type: EUserType.LISTENER,
        email: user.email,
      });
      if (listenerProfile.error) {
        throw new Error(listenerProfile.message);
      }
      user = listenerProfile.data.user as IUserDoc;
    }

    if (user.userType === EUserType.CREATOR) {
      const creatorProfile = await creatorService.createCreatorProfile({
        user: user,
        type: EUserType.CREATOR,
        email: user.email,
      });
      if (creatorProfile.error) {
        throw new Error(creatorProfile.message);
      }
      user = creatorProfile.data.user as IUserDoc;
    }

    if (user.userType === EUserType.PREACHER) {
      const preacherProfile = await preacherService.createPreacherProfile({
        user: user,
        type: EUserType.PREACHER,
        email: user.email,
      });
      if (preacherProfile.error) {
        throw new Error(preacherProfile.message);
      }
      user = preacherProfile.data.user as IUserDoc;
    }

    if (user.userType === EUserType.STAFF) {
      const staffProfile = await staffService.createStaff({
        user: user,
        email: user.email,
      });
      if (staffProfile.error) {
        throw new Error(staffProfile.message);
      }
      user = staffProfile.data.user as IUserDoc;
    }

    await this.encryptUserPassword(user, password);
    await user.save();

    return user;
  }

  /**
   * @name checkEmail
   * @description validates against invalid email
   * @param email - The email to check
   *
   * @returns {boolean} true/false to determine the state of the email
   */
  public async checkEmail(email: string): Promise<boolean> {
    const match = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let matched: boolean = match.test(email);

    // bypass .africa domain
    if (strIncludesEs6(email, ".africa")) {
      matched = true;
    } else {
      matched = matched;
    }

    return matched;
  }

  /**
   * @name checkPassword
   * @description validates against invalid password
   * password must contain at least 8 characters,
   * 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number
   * @param password
   *
   * @returns {boolean} true/false to determine the state of the password
   */
  public async checkPassword(password: string): Promise<boolean> {
    const match = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;
    const matched: boolean = match.test(password);

    return matched;
  }

  /**
   * @name validateLoginCredentials
   * @param data
   */
  public async validateLoginCredentials(data: ILogin): Promise<IResult> {
    if (!data) {
      this.result.error = true;
      this.result.message = "login credentials are required";
    } else {
      if (!data.email) {
        this.result.error = true;
        this.result.message = "email is required";
      } else if (!data.password) {
        this.result.error = true;
        this.result.message = "password is required";
      } else {
        this.result.error = false;
        this.result.message = "";
      }
    }

    return this.result;
  }

  /**
   * @name validateUserType
   * @param type
   * @returns
   */
  public async validateUserType(type: string): Promise<boolean> {
    let flag = false;
    const list = [
      EUserType.USER,
      EUserType.LISTENER,
      EUserType.CREATOR,
      EUserType.PREACHER,
      EUserType.STAFF,
    ];

    if (arrayIncludes(list, type)) {
      flag = true;
    } else {
      flag = false;
    }

    return flag;
  }

  /**
   * @name createBulkUsers
   * @param data
   * @param options
   */
  public async createBulkUsers(
    data: Array<IBulkUser>,
    options: { isNew: boolean }
  ): Promise<void> {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        let bulk: IBulkUser = data[i];
        let password: string = UIID(1).toString();
        let exist = await User.findOne({ email: bulk.email });

        if (!exist && options.isNew) {
          // create the user
          let user = await User.create({
            firstName: bulk.firstName ? bulk.firstName : "",
            lastName: bulk.lastName ? bulk.lastName : "",
            email: bulk.email.toLowerCase(),
            password,
            phoneNumber: bulk.phoneNumber,
            phoneCode: bulk.phoneCode,
          });

          let phone = this.attachPhoneCode(bulk.phoneCode, bulk.phoneNumber);
          user.countryPhone = phone;
          await user.save();

          // encrypt password
          await this.encryptUserPassword(user, password);
        }
      }
    }
  }

  /**
   * @name attachPhoneCode
   * @param code
   * @param phone
   * @returns
   */
  public attachPhoneCode(code: string, phone: string): string {
    let result: string = "";
    let codeStr: string = "";

    if (code && phone) {
      if (strIncludesEs6(code, "-")) {
        codeStr = code.substring(3);
        codeStr = `+${codeStr}`;
      } else if (strIncludesEs6(code, "+")) {
        codeStr = code;
      } else {
        codeStr = code;
      }

      result = codeStr + phone.substring(1);
    }

    return result;
  }

  /**
   * @name checkPhoneCode
   * @param code
   * @param phone
   * @returns
   */
  public checkPhoneCode(code: string, phone: string): string {
    let result: string = "";
    let phoneStr: string = "";

    if (code && phone) {
      if (!strIncludesEs6(phone, "+") && phone.length > 10) {
        phoneStr = phone.substring(3);
        result = `${code}${phoneStr}`;
      } else if (strIncludesEs6(phone, "+")) {
        result = phone;
      }
    }

    return result;
  }

  /**
   * @name phoneExists
   * @param phone
   * @returns
   */
  public async phoneExists(phone: string): Promise<boolean> {
    let result: boolean = false;

    const exist = await User.findOne({
      $or: [{ phoneNumber: phone }, { altPhone: phone }],
    });

    if (exist) {
      result = true;
    }

    return result;
  }

  /**
   * @name updateLastLogin
   * @description updates the last time user logged into the system
   * @param user
   */
  public async updateLastLogin(user: IUserDoc): Promise<void> {
    const today = dateToday(new Date());
    user.lastLogin = today.ISO;
    await user.save();
  }

  /**
   * @name activateAccount
   * @param user
   */
  public async activateAccount(user: IUserDoc): Promise<void> {
    user.isActive = true;
    user.isLocked = false;
    user.loginLimit = 0;
    await user.save();
  }

  /**
   * @name deactivateAccount
   * @param user
   */
  public async deactivateAccount(user: IUserDoc): Promise<void> {
    user.isActive = false;
    user.isLocked = true;
    user.isDeactivated = true;
    await user.save();
  }

  /**
   * Check if user account is locked
   * @param user - User document
   * @returns boolean
   */
  async checkLockedStatus(user: IUserDoc): Promise<boolean> {
    if (!user.isLocked || !user.lockedUntil) {
      return false;
    }

    // If lock duration has passed, unlock the account
    if (new Date() > user.lockedUntil) {
      user.isLocked = false;
      user.lockedUntil = null;
      user.loginLimit = 0;
      await user.save();
      return false;
    }

    return true;
  }

  /**
   * Increases login attempt counter and locks account if limit exceeded
   * @param user - User document
   * @returns number - Current login attempt count
   */
  public async increaseLoginLimit(user: IUserDoc): Promise<number> {
    // Increment login attempt counter
    user.loginLimit = (user.loginLimit || 0) + 1;

    // If attempts exceed 5, lock the account for 30 minutes
    if (user.loginLimit >= 5) {
      user.isLocked = true;
      user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    }

    await user.save();
    return user.loginLimit;
  }

  /**
   * Update user login information
   * @param user - User document
   * @param req - Express Request object
   */
  async updateLoginInfo(user: IUserDoc, req: Request): Promise<void> {
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();

    // Get location info from IP
    const geo = geoip.lookup(req.ip as string);

    user.loginInfo = {
      ip: req.ip?.toString() as string,
      deviceType: userAgent as string,
      platform: detectPlatform(device.type),
      deviceInfo: {
        manufacturer: device.vendor,
        model: device.model,
        osName: os.name as string,
        osVersion: os.version as string,
        browser: browser.name,
        browserVersion: browser.version,
        appVersion: req.headers["app-version"] as string,
      },
      location: {
        country: geo?.country as string,
        city: geo?.city as string,
        timezone: geo?.timezone as string,
      },
    };
    await user.save();
  }

  /**
   * @name generateOTPCode
   * @param user
   * @returns
   */
  public async generateOTPCode(
    user: IUserDoc,
    type: EOtpType
  ): Promise<string> {
    const gencode = Random.randomNum(6);
    user.Otp = gencode.toString();
    user.OtpExpiry = Date.now() + 15 * 60 * 1000;
    user.otpType = type;
    await user.save();

    return gencode.toString();
  }

  /**
   * @name verifyOTPCode
   * @param user
   * @param code
   * @returns
   */
  public async verifyOTPCode(code: string): Promise<IUserDoc | null> {
    const today = Date.now(); // get timestamp from today's date
    const _foundUser = await User.findOne({
      Otp: code.toString(),
      OtpExpiry: { $gt: today },
    });

    return _foundUser ? _foundUser : null;
  }

  /**
   * @name verifyOTP
   * @param user
   * @param code
   * @returns
   */
  public async verifyOTP(email: string, code: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };
    const today = Date.now();

    const user = await User.findOne({ email: email, Otp: code.toString() });

    if (!user) {
      result.error = true;
      result.message = "Invalid OTP code";
      result.code = 400;
      return result;
    }

    if (user.OtpExpiry && user.OtpExpiry < today) {
      // Clear expired OTP
      user.Otp = "";
      user.OtpExpiry = 0;
      await user.save();

      result.error = true;
      result.message = "OTP has expired. Please request a new one";
      result.code = 400;
      return result;
    }

    // Valid OTP
    result.data = user;
    result.message = "OTP verified successfully";

    // Clear used OTP
    user.Otp = "";
    user.OtpExpiry = 0;
    await user.save();

    return result;
  }

  /**
   * @name encryptUserPassword
   * @param user
   * @param password
   * @returns
   */
  public async encryptUserPassword(
    user: IUserDoc,
    password: string
  ): Promise<boolean> {
    let result: boolean = false;

    console.log("Encrypting password for:", user.email);

    const encrypted = await SystemService.encryptData({
      payload: password,
      password: user.email,
      separator: "-",
    });

    console.log("Encrypted Password:", encrypted);

    if (encrypted) {
      user.password = encrypted;
      //await user.save();

      result = true;
    }
    return result;
  }

  /**
   * @name decryptUserPassword
   * @param user
   * @returns
   */
  public async decryptUserPassword(user: IUserDoc): Promise<string | null> {
    let result: string | null = null;

    console.log("Decrypting password for:", user.email);
    console.log("Stored Encrypted Password:", user.password);

    const decrypted = await SystemService.decryptData({
      password: user.email,
      payload: user.password,
      separator: "-",
    });

    console.log("Decrypted Password:", decrypted.data.toString());

    result = decrypted.data.toString();

    return result;
  }

  /**
   * @name matchEncryptedPassword
   * @param data - MatchEncryptedPasswordDTO
   * @returns
   */
  public async matchEncryptedPassword(
    data: MatchEncryptedPasswordDTO
  ): Promise<boolean> {
    let result: boolean = false;
    const { hash, user } = data;

    const hashDecrypt = await SystemService.encryptData({
      password: user.email,
      payload: hash,
      separator: "-",
    });

    if (user.password === hashDecrypt) {
      result = true;
    }

    return result;
  }

  /**
   * @name getLoggedInUser
   * @param data
   * @returns
   */
  public async getLoggedInUser(data: {
    req: Request;
    isAdmin: boolean;
  }): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };
    const { req, isAdmin } = data;

    const user = await userRepository.findById((req as any).user._id, true);

    if (!user) {
      result.error = true;
      result.message = `authorized  - user details not found`;
      result.code = 401;
    } else if (
      user &&
      isAdmin === false &&
      (user.userType === EUserType.STAFF ||
        user.userType === EUserType.SUPERADMIN)
    ) {
      result.error = true;
      result.message = `user is not authorized to access this route`;
      result.code = 401;
    } else {
      result.error = false;
      result.data = {
        user: user,
      };
    }

    return result;
  }

  /**
   * @name attachRole
   * @param user
   * @param role
   */
  public async attachRole(user: IUserDoc, role: string): Promise<void> {
    const userRole = await Role.findOne({ name: role });

    if (userRole) {
      user.role = userRole._id;
      userRole.users = [...userRole.users, user._id];
      await user.save();
      await userRole.save;
    }

    new ErrorResponse(`Role ${role} does not exist.`, 400, []);
  }

  /**
   * Gets user notification preferences
   * @param userId - The ID of the user
   * @returns Object containing notification preference settings
   */
  public async getNotificationPreferences(userId: string): Promise<{
    email: boolean;
    push: boolean;
    sms: boolean;
  }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      email: user.notificationPreferences?.email ?? true,
      push: user.notificationPreferences?.push ?? true,
      sms: user.notificationPreferences?.sms ?? true,
    };
  }

  /**
   * Updates user notification preferences
   * @param userId - The ID of the user
   * @param preferences - Object containing notification preferences to update
   */
  public async updateNotificationPreferences(
    userId: string,
    preferences: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    }
  ): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences,
    };

    await user.save();
  }
}

export default new UserService();

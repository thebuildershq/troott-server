import { Request } from "express";
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
import { EUserType } from "../utils/enums.util";
import { LoginDTO, MatchEncryptedPasswordDTO, RegisterUserDTO } from "../dtos/auth.dto";
import { CreateUserDTO } from "../dtos/user.dto";
import User from "../models/User.model";
import Role from "../models/Role.model";

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
   * It checks:
   * - that the email, first name, last name, and password are provided,
   * - and that the `userType` is one of the allowed system-defined user roles (Listener, Creator, Preacher).
   *
   * This validation helps prevent invalid or malformed registration attempts from reaching the database layer.
   *
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
    } else if (!arrayIncludes(allowedUsers, data.userType)) {
      result.error = true;
      result.message = `Invalid user type value. choose from ${allowedUsers.join(",")}`;
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
  public async createUser(data: CreateUserDTO): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };
    
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      result.error = true;
      result.message = "User already exists";
      result.code = 400;
      return result;
    }
  
    // Create base user
    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      password: data.password,
      userType: data.userType
    });
  
    if (!user) {
      result.error = true;
      result.message = "Failed to create user";
      result.code = 500;
      return result;
    }
  
    // Encrypt password
    await this.encryptUserPassword(user, data.password);
  
    // Handle specific user type operations
    if (user.userType === EUserType.LISTENER) {
      await listenerService.createListenerProfile({
        user: user._id,
        _id: user._id
      });
      // Create default subscription
      await subscriptionService.createDefaultSubscription(user._id);
    }
  
    if (user.userType === EUserType.CREATOR) {
      await creatorService.createCreatorProfile({
        user: user._id,
        _id: user._id
      });
    }
  
    if (user.userType === EUserType.PREACHER) {
      await preacherService.createPreacherProfile({
        user: user._id,
        _id: user._id
      });
    }
  
    if (user.userType === EUserType.STAFF) {
      // Generate API keys for staff
      const apiKey = await SystemService.generateAPIKey();
      user.apiKey = apiKey;
      await user.save();
    }
  
    result.data = user;
    result.message = "User created successfully";
    return result;
  }

  public async createUsser(data: CreateUserDTO): Promise<IUserDoc> {
    
    let fName: string = "",
      lName: string = "";
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      result.error = true;
      result.message = "User already exists";
      result.data = {};
      return result;
    }



    
    if (user.data.userType === EUserType.LISTENER) {
      const listenerData = {
        user: user.data._id,
        _id: user.data._id,
      };

      await listenerService.createListenerProfile(listenerData);

      res.status(201).json({
        error: false,
        errors: [],
        data: user,
        message: "User registered successfully.",
        status: 200,
      });
    }
    if (user.data.userType === EUserType.CREATOR) {
      const creatorData = {
        user: user.data._id,
        _id: user.data._id,
      };

      await creatorService.createCreatorProfile(creatorData);

      res.status(201).json({
        error: false,
        errors: [],
        data: user,
        message: "User registered successfully.",
        status: 200,
      });
    }

    if (user.data.userType === EUserType.PREACHER) {
      const preacherData = {
        user: user.data._id,
        _id: user.data._id,
      };

      await preacherService.createPreacherProfile(preacherData);

      res.status(201).json({
        error: false,
        errors: [],
        data: user,
        message: "User registered successfully.",
        status: 200,
      });
    }

    const user = await User.create({
      firstName: data.firstName ? data.firstName : fName,
      lastName: data.lastName ? data.lastName : lName,
      email: data.email.toLowerCase(),
      password: data.password,
    });

    if (!user) {
      result.error = true;
      result.message = "Failed to create user";
      return result;
    }

    result.data = user;

    await this.encryptUserPassword(user, data.password);

    return result;
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
    const list = [EUserType.USER, EUserType.LISTENER, EUserType.CREATOR, EUserType.PREACHER, EUserType.STAFF]

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
    // await user.save();
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
    await user.save();
  }

  /**
   * @name initiateOTPCode
   * @param user
   * @returns
   */
  public async generateOTPCode(user: IUserDoc): Promise<string> {
    const gencode = Random.randomNum(6);
    user.Otp = gencode.toString();
    user.OtpExpiry = Date.now() + 15 * 60 * 1000; 
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
      user.OtpExpiry = undefined;
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
    user.OtpExpiry = undefined;
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
      await user.save();

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

    console.log("Decrypting password for:", user.email); // Debug log
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
   * @param data
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
      (user.userType === EUserType.STAFF || user.userType === EUserType.SUPERADMIN)
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


}

export default new UserService();

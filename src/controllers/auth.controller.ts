import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/async.mdw";
import ErrorResponse from "../utils/error.util";
import User from "../models/User.model";
import {
  ChangePasswordDTO,
  LoginDTO,
  RegisterUserDTO,
  resendOtpDTO,
  ResetPasswordDTO,
  verifyOtpDTO,
} from "../dtos/auth.dto";
import userService from "../services/user.service";
import {
  EmailService,
  EmailTemplate,
  OtpType,
  PasswordType,
  UserType,
} from "../utils/enums.util";
import emailService from "../services/email.service";
import tokenService from "../services/token.service";
import { IUserDoc } from "../utils/interface.util";

/**
 * @name registerUser
 * @description Registers a new user
 * @route POST /auth/register
 * @access Public
 * @returns registered user
 */
export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password, userType }: RegisterUserDTO =
      req.body;

    const validate = await userService.validateRegister(req.body);
    if (validate.error) {
      return next(new ErrorResponse(validate.message, validate.code!, []));
    }

    const mailCheck = await userService.checkEmail(email);
    if (!mailCheck) {
      return next(new ErrorResponse("A valid email is required", 400, []));
    }

    const userExist = await User.findOne({ email: email.toLowerCase() });
    if (userExist) {
      if (userExist.userType === UserType.SUPERADMIN) {
        return next(
          new ErrorResponse("Forbidden!, use another email", 400, [])
        );
      }

      return next(
        new ErrorResponse("User already exist, use another email", 400, [])
      );
    }

    const passwordCheck = await userService.checkPassword(password);
    if (!passwordCheck) {
      return next(
        new ErrorResponse(
          "password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number",
          400,
          []
        )
      );
    }

    const user = await userService.createUser({
      firstName,
      lastName,
      email,
      password,
      passwordType: PasswordType.USERGENERATED,
      userType: userType as UserType,
    });
    if (!user) {
      return next(new ErrorResponse("user not created", 404, []));
    }

    await userService.updateUserType(user, userType as UserType);

    const Otp = await userService.generateOTPCode(user, OtpType.REGISTER);

    if (Otp) {
      const sendOTP = await emailService.sendOTPEmail({
        user,
        code: Otp,
        otpType: OtpType.REGISTER,
      });

      if (sendOTP.error) {
        return next(new ErrorResponse(sendOTP.message, sendOTP.code!, []));
      }
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: user,
      message: "OTP has been sent to your email!",
      status: 200,
    });
  }
);

/**
 * @name activateUserAccount
 * @description Activates a user account using OTP
 * @route POST /auth/activate
 * @access Public
 */
export const activateUserAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, otpType }: verifyOtpDTO = req.body;

    if (!email || !otp) {
      return next(new ErrorResponse("Email and OTP are required", 400, []));
    }

    // use OTP to find the user

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new ErrorResponse("User not found", 404, []));
    }
    // Check if account is already active
    if (user.isActive) {
      return next(new ErrorResponse("Account is already activated", 400, []));
    }

    const otpVerification = await userService.verifyOTP({
      email: user.email,
      otp: otp,
      otpType,
    });
    if (otpVerification.error) {
      return next(
        new ErrorResponse(otpVerification.message, otpVerification.code!, [])
      );
    }

    // Activate the user account and Update login information
    await userService.activateAccount(user);
    await userService.updateLastLogin(user);
    await userService.updateLoginInfo(user, req);

    // assign token to the user
    const token = await tokenService.attachToken(user);
    if (token.error) {
      return next(new ErrorResponse(token.message, token.code!, []));
    }

    // Send welcome email after activation
    const welcomEmail = await emailService.sendUserWelcomeEmail(user);
    if (welcomEmail.error) {
      return next(new ErrorResponse(welcomEmail.message, welcomEmail.code, []));
    }

    await user.save();

    res.status(200).json({
      error: false,
      errors: [],
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isActive: user.isActive,
          isActivated: user.isActivated,
        },
        token: token.data.token,
      },
      message: "Account activated successfully",
      status: 200,
    });
  }
);

/**
 * @name loginUser
 * @description Logs in a user
 * @route POST /auth/login
 * @access Public
 */
export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: LoginDTO = req.body;

    const validate = await userService.validateLogin(req.body);
    if (validate.error) {
      return next(new ErrorResponse(validate.message, validate.code!, []));
    }

    const userExist = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!userExist) {
      return next(new ErrorResponse("invalid credentials", 400, []));
    }

    // Check if account is locked
    if (await userService.checkLockedStatus(userExist)) {
      return next(
        new ErrorResponse("Account is locked. Please try again later", 423, [])
      );
    }

    // Check if account is deactivated
    if (userExist.isDeactivated) {
      return next(new ErrorResponse("Account has been deactivated", 403, []));
    }

    // check password is correct
    const verifyPassword = await userService.matchEncryptedPassword({
      hash: password,
      user: userExist,
    });
    if (!verifyPassword) {
      await userService.increaseLoginLimit(userExist);
      return next(new ErrorResponse("invalid credentials", 400, []));
    }

    if (!userExist.isActive) {
      return next(
        new ErrorResponse(
          "Inactive account, kindly verify otp to activate account.",
          206,
          []
        )
      );
    }

    // Update login information
    await userService.activateAccount(userExist);
    await userService.updateLastLogin(userExist);
    await userService.updateLoginInfo(userExist, req);

    await userExist.save();

    const token = await tokenService.attachToken(userExist);
    if (token.error) {
      return next(new ErrorResponse(token.message, token.code!, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: {
        user: {
          id: userExist.id,
          email: userExist.email,
          firstName: userExist.firstName,
          lastName: userExist.lastName,
          userType: userExist.userType,
        },
        token: token.data.token,
      },
      message: "User logged in successfully.",
      status: 200,
    });
  }
);

/**
 * @name logoutUser
 * @description Logs out a user and invalidates the session/token
 * @route POST /api/auth/logout
 * @access Private
 */
export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id as IUserDoc;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse("User not found", 404, []));
    }

    const result = await tokenService.detachToken(user);
    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    await userService.updateLastLogin(user);
    await userService.updateLoginInfo(user, req);

    await user.save();

    return res.status(200).json({
      error: false,
      errors: [],
      message: "User logged out successfully.",
      status: 200,
    });
  }
);

/**
 * @name RefreshToken
 * @description Automatically generates a new token for a user if the current token is near expiry
 * @route POST /auth/token
 * @access Private
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return next(new ErrorResponse("Unauthorized", 401, []));
    }

    const sendToken = await tokenService.refreshToken(accessToken);

    if (sendToken.error) {
      return next(new ErrorResponse(sendToken.message, sendToken.code, []));
    }

    res.status(200).json({
      error: false,
      message: { message: sendToken.message },
      data: { token: sendToken.data.token },
    });
  }
);

/**
 * @name forgotPassword
 * @description Allows user request OTP to reset their password
 * @route POST /auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!userService.checkEmail(email)) {
      return next(new ErrorResponse("Invalid email format.", 400, []));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(
        new ErrorResponse("User with this email does not exist", 404, [])
      );
    }

    // Check if account is locked or deactivated}
    if (await userService.checkLockedStatus(user)) {
      return next(
        new ErrorResponse("Account is locked. Please try again later", 423, [])
      );
    }

    if (user.isDeactivated) {
      return next(new ErrorResponse("Account has been deactivated", 403, []));
    }

    const OTP = await userService.generateOTPCode(user, OtpType.FORGOTPASSWORD);

    if (OTP) {
      const sendOTP = await emailService.sendOTPEmail({
        user,
        code: OTP,
        otpType: OtpType.FORGOTPASSWORD,
      });

      if (sendOTP.error) {
        return next(new ErrorResponse(sendOTP.message, sendOTP.code!, []));
      }
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: {},
      message: "Password reset OTP sent to your email",
      status: 200,
    });
  }
);

/**
 * @name resetPassword
 * @description Allows user change their password using the OTP
 * @route POST /auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, newPassword }: ResetPasswordDTO = req.body;

    if (!email || !newPassword) {
      return next(
        new ErrorResponse("Email, OTP, and new password are required", 400, [])
      );
    }

    const passCheck = await userService.checkPassword(newPassword);
    if (!passCheck) {
      return next(
        new ErrorResponse(
          "Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number",
          400,
          []
        )
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new ErrorResponse("User not found", 404, []));
    }

    await userService.encryptUserPassword(user, newPassword);

    const sendEmail = await emailService.sendPasswordResetNotificationEmail(
      user
    );
    if (sendEmail.error) {
      return next(new ErrorResponse(sendEmail.message, sendEmail.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: {},
      message: "Password reset successfully",
      status: 200,
    });
  }
);

/**
 * @name changePassword
 * @description Allows user to change their password using their old password
 * @route POST /auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id as IUserDoc;

    const { currentPassword, newPassword }: ChangePasswordDTO = req.body;
    if (!currentPassword || !newPassword) {
      return next(
        new ErrorResponse("Current and new password are required", 400, [])
      );
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return next(new ErrorResponse("User not found", 404, []));
    }

    const isMatch = await await userService.matchEncryptedPassword({
      hash: currentPassword,
      user: user,
    });
    if (!isMatch) {
      return next(new ErrorResponse("Current password is incorrect", 400, []));
    }

    const passCheck = await userService.checkPassword(newPassword);
    if (!passCheck) {
      return next(
        new ErrorResponse(
          "Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number",
          400,
          []
        )
      );
    }

    await userService.encryptUserPassword(user, newPassword);

    const sendEmail = await emailService.sendPasswordChangeNotificationEmail(
      user
    );
    if (sendEmail.error) {
      return next(new ErrorResponse(sendEmail.message, sendEmail.code, []));
    }

    await user.save();

    res.status(200).json({
      error: false,
      errors: [],
      data: {},
      message: "Password changed successfully",
      status: 200,
    });
  }
);

/**
 * @name verifyOTP
 * @description API endpoint to verify the a user OTP.
 * @route POST /auth/verify-otp
 * @access Public
 */
export const verifyOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, otpType }: verifyOtpDTO = req.body;

    if (!email || !otp || !otpType) {
      return next(
        new ErrorResponse("Email and reset code are required", 400, [])
      );
    }

    const otpVerification = await userService.verifyOTP({
      email,
      otp,
      otpType,
    });
    if (otpVerification.error) {
      return next(
        new ErrorResponse(otpVerification.message, otpVerification.code!, [])
      );
    }

    return res.status(200).json({
      error: false,
      message: "OTP verified successfully",
      data: {},
      status: 200,
    });
  }
);

/**
 * @name resendOTP
 * @description API endpoint to resendOTP to a user.
 * @route POST /auth/resend-otp
 * @access Public
 */
export const resendOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otpType }: resendOtpDTO = req.body;

    if (!email) {
      return next(new ErrorResponse("Email is required", 400, []));
    }

    if (!otpType) return next(new ErrorResponse("otptype is required", 400, []));

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(new ErrorResponse("User doesn't exist", 400, []));
    }

    const OTP = await userService.generateOTPCode(user, otpType);

    if (OTP) {
      const sendOTP = await emailService.sendOTPEmail({
        user,
        code: OTP,
        otpType,
      });

      if (sendOTP.error) {
        return next(new ErrorResponse(sendOTP.message, sendOTP.code!, []));
      }
    }

    return res.status(200).json({
      error: false,
      message: "OTP has been sent to your email!",
      data: {},
      status: 200,
    });
  }
);

// Sign in with Google
// Sign in with Apple

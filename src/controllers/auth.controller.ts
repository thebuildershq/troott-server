import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middleware/async.mdw";
import ErrorResponse from "../utils/error.util";
import authMapper from "../mappers/auth.mapper";
import User from "../models/User.model";
import { RegisterDTO } from "../dtos/auth.dto";
import userService from "../services/user.service";
import { UserType } from "../utils/enums.util";
import AuthService from "../services/auth.service";
import emailService from "../services/email.service";
import tokenService from "../services/token.service";
import { generateRandomCode } from "../utils/helper.util";
import { IUserDoc } from "../utils/interface.util";

/**
 * @name registerUser
 * @description Registers a new user
 * @route POST /auth/register
 * @access Public
 */
export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password, userType }: RegisterDTO =
      req.body;
    const validate = await AuthService.validateRegister(req.body);

    if (validate.error) {
      return next(
        new ErrorResponse("Error", validate.code!, [validate.message])
      );
    }

    const isSuperadmin = await User.findOne({
      email,
      userType: UserType.SUPERADMIN,
    });

    if (isSuperadmin) {
      return next(new ErrorResponse("Error", 400, ["use another email"]));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        new ErrorResponse("Error", 400, [
          "user already exists, use another email",
        ])
      );
    }

    let role;
    if (userType === UserType.CREATOR) {
      role = UserType.CREATOR;
    } else if (userType === UserType.ADMIN) {
      role = UserType.ADMIN;
    } else {
      role = UserType.LISTENER;
    }

    // Create new user
    const user = await userService.createUser({
      firstName,
      lastName,
      email,
      password,
      userType,
      role,
    });

    const activateInfo = await AuthService.sendVerificationEmail(user);

    if (activateInfo.error) {
      return next(
        new ErrorResponse("Error", activateInfo.code!, [activateInfo.message])
      );
    }

    user.activationCode = activateInfo.data.verificationCode;
    user.activationCodeExpire = activateInfo.data.verificationCodeExpire;
    await user.save();

    const mappedUser = await authMapper.mapRegisteredUser(user);

    await emailService.sendWelcomeEmail(user.email, user.firstName);

    res.status(201).json({
      error: false,
      errors: [],
      data: mappedUser,
      message: "User registered successfully.",
      status: 201,
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
    const { email, password } = req.body;

    const validate = await AuthService.validateLogin(req.body);

    if (validate.error) {
      return next(
        new ErrorResponse("Error", validate.code!, [validate.message])
      );
    }

    const tokenResult = await tokenService.attachToken(validate.data.user);

    if (tokenResult.error) {
      return next(
        new ErrorResponse("Error", tokenResult.code!, [tokenResult.message])
      );
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: { token: tokenResult.data.token },
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
    return res.status(200).json({
      error: false,
      errors: [],
      message: "User logged out successfully.",
      status: 200,
    });
  }
);

/**
 * @name forgotPassword
 * @description Allows user request to a link to reset their password
 * @route POST /auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!emailService.validateEmail(email)) {
      return next(new ErrorResponse("Invalid email format.", 400, []));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new ErrorResponse("Error", 404, ["User with this email does not exist"])
      );
    }

    const resetToken = generateRandomCode(6);
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpirationDate = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    const emailResult = await emailService.sendPasswordForgotEmail(
      user.email,
      user.firstName,
      resetToken
    );

    if (emailResult.error) {
      return next(
        new ErrorResponse("Error", emailResult.code, [emailResult.message])
      );
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: {},
      message: "Forgot Password link sent to your email",
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
    const { oldPassword, newPassword } = req.body;
    const userId = (req as any).user.id as IUserDoc

    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorResponse("Error", 404, ["User not found"]));
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return next(new ErrorResponse("Error", 400, ["Old password is incorrect"]));
    }

    if (!userService.checkPassword(newPassword)) {
      return next(
        new ErrorResponse(
          "Error",
          400,
          ["password must contain, 1 uppercase letter, one special character, one number and must be greater than 8 characters"]
        )
      );
    }

    user.password = newPassword;
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

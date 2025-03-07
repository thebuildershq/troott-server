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
      data: { token: tokenResult.data.token},
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
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new ErrorResponse("error", 400, ["No token provided"]));
    }

    try {
      await tokenService.invalidateToken(token); // Assuming you have a method to invalidate the token
      res.status(200).json({
        error: false,
        errors: [],
        message: "User logged out successfully.",
        status: 200,
      });
    } catch (error) {
      return next(new ErrorResponse("error", 500, ["Failed to log out user"]));
    }
  }
);


/**
 * @name refreshToken
 * @description Refreshes the authentication token
 * @route POST /api/auth/refresh
 * @access Private
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new ErrorResponse("error", 400, ["No token provided"]));
    }

    try {
      const newToken = await tokenService.getAuthToken(token); // Assuming you have a method to refresh the token
      res.status(200).json({
        error: false,
        errors: [],
        data: { token: newToken },
        message: "Token refreshed successfully.",
        status: 200,
      });
    } catch (error) {
      return next(new ErrorResponse("error", 500, ["Failed to refresh token"]));
    }
  }
);
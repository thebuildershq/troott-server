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

/**
 * @name registerUser
 * @description Registers a new user
 * @route POST /auth/register
 * @access Public
 */
export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
      userType,
    }: RegisterDTO = req.body;
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
      return next(
        new ErrorResponse("Error", 400, ["user already exists, use another email"])
      );
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
      dateOfBirth,
      gender,
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

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(
        new ErrorResponse("error", 401, [
          "User doesn't exist, please register",
        ])
      );
    }



    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(
        new ErrorResponse("Invalid credentials", 401, [
          "Invalid email or password",
        ])
      );
    }

    // Generate token
    const token = user.getAuthToken();

    res.status(200).json({
      error: false,
      errors: [],
      data: { token },
      message: "User logged in successfully.",
      status: 200,
    });
  }
);



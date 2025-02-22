



import { Request, Response, NextFunction } from "express";
import sgMail from "@sendgrid/mail";
import { asyncHandler } from "@btffamily/pacitude";
import ErrorResponse from "../utils/error.util";
import authMapper from "../mappers/auth.mapper";
import User from "../models/User.model";


sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

/**
 * @name getUser
 * @description Retrieves user information excluding email, password, and permission settings
 * @route GET /user
 * @access  Private
 */
export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse("Error", 404, ["User  not found"]));
    }

    // Map the user information to include only the specified fields
    const userInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      countryPhone: user.countryPhone,
    };

    res.status(200).json({
      error: false,
      errors: [],
      data: userInfo,
      message: "User information retrieved successfully.",
      status: 200,
    });
  }
);

/**
 * @name editUser
 * @description Edits user information excluding email, password, and permission settings
 * @route PUT /user
 * @access  Private
 */
export const editUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id; // Assuming user ID is available in the request
    const {
      username,
      firstName,
      lastName,
      phoneNumber,
      phoneCode,
      countryPhone,
    } = req.body; // Example fields to edit

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse("Error", 404, ["User  not found"]));
    }

    // Update user information
    user.firstName = firstName || user.firstName;
    user.username = username || user.username;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.phoneCode = phoneCode || user.phoneCode;
    user.countryPhone = countryPhone || user.countryPhone;

    await user.save();

    const mapped = await authMapper.mapRegisteredUser(user);

    res.status(201).json({
      error: false,
      errors: [],
      data: mapped,
      message: "User information updated successfully.",
      status: 201,
    });
  }
);

/**
 * @name deactivateAccount
 * @description Deactivates the user account
 * @route DELETE /user/deactivate
 * @access  Private
 */
export const deactivateAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse("Error", 404, ["User  not found"]));
    }

    // Deactivate the user account
    user.isDeactivated = true;
    await user.save();

    res.status(200).json({
      error: false,
      errors: [],
      message: "User account deactivated successfully.",
      status: 200,
    });
  }
);


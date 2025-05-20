import { Request, Response, NextFunction } from "express";
import sgMail from "@sendgrid/mail";
import { asyncHandler } from "@btffamily/pacitude";
import ErrorResponse from "../utils/error.util";
import authMapper from "../mappers/auth.mapper";
import User from "../models/User.model";
import { createUserDTO, inviteUserDTO } from "../dtos/user.dto";
import userService from "../services/user.service";
import { generatePassword } from "../utils/helper.util";
import { EEmailDriver, EEmailTemplate, EPasswordType, EUserType } from "../utils/enums.util";
import emailService from "../services/email.service";


sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);




/**
 * @name inviteUser
 * @description invite user to join the platform
 * @route POST /user/invite
 * @access private (admin only)
 * @returns {Object} staff profile
 */
export const In = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
      const { firstName, lastName, email, userType }: inviteUserDTO = req.body;
      const invitedBy = req.user.id;

      // Validate input
    const validate = await userService.validateRegister(req.body);
    if (validate.error) {
      return next(new ErrorResponse("Error", validate.code!, [validate.message]));
    }

    // Check email validity
    const mailCheck = await userService.checkEmail(email);
    if (!mailCheck) {
      return next(new ErrorResponse("Error", 400, ["A valid email is required"]));
    }

    // Check if user already exists
    const userExist = await User.findOne({ email: email.toLowerCase() });
    if (userExist) {
      return next(new ErrorResponse("Error", 400, ["Email already exists"]));
    }

    // Generate temporary password
    const temporaryPassword = generatePassword(20);

    // Create user with temporary password
    const user = await userService.createUser({
      firstName,
      lastName,
      email,
      password: temporaryPassword,
      passwordType: EPasswordType.SYSTEMGENERATED,
      userType: userType as EUserType,
      createdBy: invitedBy._id
    });

    if (!user) {
      return next(new ErrorResponse("Error", 404, ["Failed to create user"]));
    }

        // Send invitation email with temporary password
        const sendInvite = await emailService.sendUserInviteEmail({
          driver: EEmailDriver.SENDGRID,
          user: user,
          template: EEmailTemplate.USER_INVITE,
          options: {
            temporaryPassword,
            invitedBy: `${invitedBy.firstName} ${invitedBy.lastName}`,
            userType: userType,
            loginUrl: process.env.FRONTEND_URL + '/auth/login'
          }
        });
    
        if (sendInvite.error) {
          return next(new ErrorResponse("Error", sendInvite.code!, [sendInvite.message]));
        }
        res.status(201).json({
          error: false,
          errors: [],
          data: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType
          },
          message: "Invitation sent successfully",
          status: 201,
        })
  }
)


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

    // create user
    // get all user account 
    // get user account by id
    // update user account
    // deactivate user account
    // suspend user account
    // delete user account
    // get user preferences
    // update user preferences
    // create user preferences

    // follow a user
    // unfollow a user

    // switch user profile
    // update user roles & permissions.
    // update user account details
    // update user account status

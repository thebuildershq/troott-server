import { ObjectId } from "mongoose";
import { EUserType } from "../utils/enums.util";
import { IUserDoc } from "../utils/interface.util";

export interface RegisterUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType?: EUserType;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}
export interface verifyOtpDTO {
  email: string;
  OTP: number;
}

export interface resendOtpDTO {
  email: string;
  OTP: number;
}
export interface ResetPasswordDTO {
  email: string;
  newPassword: string;
}

export interface ChangePasswordDTO  {
  currentPassword: string;
  newPassword: string;
}

export interface EditUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;

  country?: string;
  phoneNumber?: string;
  phoneCode?: string;

  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
}

export interface MatchEncryptedPasswordDTO {
  user: IUserDoc;
  hash: string;
}

export interface AuthResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;

  isActive: boolean;
  isLocked: boolean;
  accessToken: string;
  accessTokenExpiry: Date;
}

export interface MapRegisteredUserDTO {
  id: ObjectId;

  firstName: string;
  lastName: string;
  email: string;

  phoneNumber: string;
  phoneCode: string;
  country: string;
  dateOfBirth: Date;
  gender: string;

  avatar?: string;
  userType: EUserType;
  passwordType: string;

  isSuper: boolean;
  isStaff: boolean;
  isPreacher: boolean;
  isCreator: boolean;
  isListener: boolean;

  isActive: boolean;
  isLocked: boolean;
  lockedUntil?: Date | null;

  roles: Array<ObjectId | any>;
  profiles: {
    listener?: ObjectId | any;
    creator?: ObjectId | any;
    preacher?: ObjectId | any;
    staff?: ObjectId | any;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferencesDTO {
  email: boolean;
  push: boolean;
  sms: boolean;
}

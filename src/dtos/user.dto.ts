import { ObjectId } from "mongoose";

export interface CreateUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
 
    userType: string;
    role: ObjectId | any;

    dateOfBirth?: Date;
    gender?: string;
    phoneNumber?: string;
    phoneCode?: string;

    profileImage?: string;
    device?: string;
    isActivated?: boolean;
    isSuper?: boolean;
    isAdmin?: boolean;
    isUser?: boolean;
    isCreator?: boolean;
    isActive?: boolean;
    loginLimit?: number;
    isLocked?: boolean;
    lockedUntil?: Date;
    lastLogin?: Date;
}

export interface EditUserDTO {
    firstName?: string;
    lastName?: string;
    username?: string;
    phoneCode?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    gender?: string;
    profileImage?: string;
    device?: string;
    isActivated?: boolean;
    isSuper?: boolean;
    isAdmin?: boolean;
    isUser?: boolean;
    isCreator?: boolean;
    isActive?: boolean;
    loginLimit?: number;
    isLocked?: boolean;
    lockedUntil?: Date;
    lastLogin?: Date;
}
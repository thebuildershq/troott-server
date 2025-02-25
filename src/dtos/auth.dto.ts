import { ObjectId } from "mongoose";

export interface RegisterDTO {
    firstName: string;
    lastName: string;
	email: string;
	password: string;
	userType: string;
}

export interface EditUserDTO {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	phoneCode: string;
	dateOfBirth: Date
}

export interface MapRegisteredUserDTO {
    id: ObjectId;

    firstName: string;
    lastName: string;
	email: string;
	phoneNumber: string;
	phoneCode: string;
	dateOfBirth: Date;
	gender: string;
	profileImage?: string;
	device?: string;

	passwordType: string;
	userType: string;

	isActivated: boolean;
	isSuper: string;
	isAdmin: string;
	isCreator: string;
	isUser: string;

	isActive: boolean;
	lastLogin: Date;
    role: any
}
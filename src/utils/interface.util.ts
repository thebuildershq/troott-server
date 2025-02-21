import { Model } from 'mongoose'
import {Document, ObjectId} from 'mongoose'

export type Nullable<T> = T | null;
export interface IRoleDoc extends Document {

    name: string,
    description: string,
    slug: string,
    user: ObjectId | any
	permissions: Array<string>

    createdAt: string,
    updatedAt: string,
    _id: ObjectId,
    id: ObjectId

    getAll(): Array<IRoleDoc>
    findByName(name: string): Nullable<IRoleDoc>
}


export interface IUserDoc extends Document {

    firstName: string;
    lastName: string;
	email: string;
	password: string;

	phoneNumber: string;
	phoneCode: string;

	dateOfBirth: Date;
	gender: string;
	profileImage: string;
	device: string;

	passwordType: string;
	savedPassword: string;
	userType: string;

	activationCode: string;
	activationCodeExpire: Date

	activationToken: string
	activationTokenExpire: Date

	resetPasswordToken: string
	resetPasswordTokenExpire: Date;

	emailCode: string
	emailCodeExpire: Date | number

	inviteToken: string
	inviteTokenExpire: Date

	isActivated: boolean;
	isSuper: string;
	isAdmin: string;
	isCreator: string;
	isUser: string;

	isActive: boolean;
	loginLimit: number;
	isLocked: boolean;
	lockedUntil: Nullable<Date>
	lastLogin: Date;

	// relationships
	role: ObjectId | any;

	// functions
	matchPassword(password: string): boolean;
	getAuthToken: () => string;
	getResetPasswordToken: () => string;
	getActivationCode: () => string;
	getInviteToken: () => string;

	// time stamps
	createdAt: string;
	updatedAt: string;
	_version: number;
	_id: ObjectId;
	id: ObjectId;
}

export interface IOptions {
	host: string;
	port: number | string;
	password: string;
	user: string
}
export interface IData {
	key: string;
	value: any;
}

export interface IResult {
	error: boolean;
	message: string;
	code: number;
	data: any;
  }

export interface ISearchQuery {
	model: Model<any>;
	ref: Nullable<string> | undefined;
	value: Nullable<any> | undefined;
	data: any;
	query: any;
	queryParam: any;
	populate: Array<any>;
	operator: Nullable<string>;
	fields?: Array<string>;
  }

export interface IResult {
  error: boolean;
  message: string;
  code: number;
  data: any;
}
  export interface IPagination {
	total: number;
	count: number;
	pagination: {
	  next: { page: number; limit: number };
	  prev: { page: number; limit: number };
	};
	data: Array<any>;
  }
  
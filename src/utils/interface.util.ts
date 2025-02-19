import {Document, ObjectId} from 'mongoose'


export interface IRoleDoc extends Document {

    name: string,
    description: string,
    slug: string,
    user: Array<ObjectId | any>

    createdAt: string,
    updatedAt: string,
    _id: ObjectId,
    id: ObjectId

    getAll(): Array<IRoleDoc>
    findByName(name: string): IRoleDoc | null
}


export interface IUserDoc extends Document {

    firstName: string;
    lastName: string;
	phoneNumber: string;
	phoneCode: string;
	email: string;
	password: string;
	passwordType: string;
	savedPassword: string;
	userType: string;

	activationToken: string | undefined;
	activationTokenExpire: Date | undefined;

	resetPasswordToken: string | undefined;
	resetPasswordTokenExpire: Date | undefined;

	emailCode: string | undefined;
	emailCodeExpire: Date | number | undefined;

	inviteToken: string | undefined;
	inviteTokenExpire: Date | undefined;

	isSuper: boolean;
	isActivated: boolean;
	isAdmin: boolean;
	isUser: boolean;

	isActive: boolean;
	loginLimit: number;
	isLocked: boolean;

	// relationships
	roles: Array<ObjectId | any>;

    // time stamps
    createdAt: string;
    updatedAt: string;
	_version: number;
	_id: ObjectId;
	id: ObjectId;
}
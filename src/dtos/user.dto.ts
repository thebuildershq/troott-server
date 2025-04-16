import { EPasswordType, EUserType } from "../utils/enums.util";

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordType: EPasswordType
  userType: EUserType;
  role?: string;
  permissions?: Array<string>;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
};
}

export interface EditUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  phoneCode?: string;
  country?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
  isActive?: boolean;
}

export interface UserProfileDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  phoneCode?: string;
  avatar?: string;
  country?: string;
  gender?: string;
  dateOfBirth?: Date;
  isActive: boolean;
  userType: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    
    phoneNumber?: string;
    phoneCode?: string;
    country?: string;
  
    avatar?: string;
    dateOfBirth?: Date;
    gender?: string;
  
    userType: string;
    isSuper: boolean;
    isStaff: boolean;
    isPreacher: boolean;
    isCreator: boolean;
    isListener: boolean;
    isActive: boolean;
    isLocked: boolean;
    lockedUntil: Date | null;
  
    notificationPreferences: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  
    roles: string[];
    profiles: {
      listener?: string;
      creator?: string;
      preacher?: string;
      staff?: string;
    };
  
    createdAt: Date;
    updatedAt: Date;
  }
  
export interface RoleDTO {
  id: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

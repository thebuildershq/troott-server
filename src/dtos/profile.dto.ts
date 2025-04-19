import { ObjectId } from "mongoose";
import { IDebitCard, ILocationInfo, IUserDoc } from "../utils/interface.util";
import { EUserType } from "../utils/enums.util";

// Listener Profile DTO
export interface createListenerDTO {
  user: IUserDoc
  userType: EUserType
  email: string;

}

export interface updateListenerDTO {
    user: ObjectId;
    firstName?: string;
    lastName?: string;
    email?: string;
    gender?: string;
    avatar?: string;
    dateOfBirth?: Date;
    country?: string;
    phoneNumber?: string;
    phoneCode?: string;
    location?: ILocationInfo;
    slug?: string;
    type?: string;
    card?: IDebitCard;

  }

// Preacher  DTO
export interface createPreacherDTO {
  user: IUserDoc
  userType: EUserType
  email: string;
}

export interface updatePreacherDTO {
    user: ObjectId;
    firstName?: string;
    lastName?: string;
    email?: string;
    gender?: string;
    avatar?: string;
    dateOfBirth?: Date;
    country?: string;
    phoneNumber?: string;
    phoneCode?: string;
    location?: ILocationInfo;
    slug?: string;
    type?: string;
    card?: IDebitCard;

  }

// Creator Profile DTO
export interface createCreatoreDTO {
  user: IUserDoc
  type: EUserType
  email: string;
}

export interface updateCreatoreDTO {
  user: IUserDoc
  userType: EUserType
  email: string;

  }

// Staff e DTO
export interface createStaffDTO {
  user: IUserDoc
  
  email: string;
}


export interface updateStaffeDTO {
    user: ObjectId;
    firstName?: string;
    lastName?: string;
    email?: string;
    gender?: string;
    avatar?: string;
    dateOfBirth?: Date;
    country?: string;
    phoneNumber?: string;
    phoneCode?: string;
    location?: ILocationInfo;
    slug?: string;
    type?: string;
    card?: IDebitCard;

  }

//listener e dto
//   // Engagement Tracking
//   playlists: Array<ObjectId>;
//   listeningHistory: Array<ObjectId>;
//   likedSermons: Array<ObjectId>;
//   sharedSermons: Array<ObjectId>;

//   viewedSermonBites: Array<ObjectId>;
//   sharedSermonBites: Array<ObjectId>;
//   savedSermonBites: Array<ObjectId>;

//   followers: Array<ObjectId>;
//   following: Array<ObjectId>;
//   interests: Array<string>;
//   badges: Array<string>;

//   // Security & Access Control
//   permissions: Array<string>;
//   twoFactorEnabled: boolean;
//   lastLogin: Date;
//   loginHistory: Array<{ date: Date; ip: string; device: string }>;
//   isActive: boolean;
//   isSuspended: boolean;
//   isDeleted: boolean;

//   // relationships

//   subscriptions: Array<ObjectId>;
//   transactions: Array<ObjectId>;
//   createdBy: ObjectId;
//   settings: ObjectId;


//preacher profile dto
// Ministry & Content
//   description: string;
//   ministry: string;
//   sermons: Array<ObjectId>;
//   featuredSermons: Array<ObjectId>;
//   bites: Array<ObjectId>;
//   topSermons: Array<ObjectId>;
//   topBites: Array<ObjectId>;

//   // Playlist System
//   playlists: Array<ObjectId>;
//   featuredPlaylists: Array<ObjectId>;

//   // Followers & Listeners
//   followers: Array<ObjectId>;
//   monthlyListeners: number;
//   likes: number;
//   shares: number;

//   // Uploads & Publications
//   uploads: Array<ObjectId>;
//   uploadHistory: Array<ObjectId>;
//   publishedCount: number;

//   // Security & Verification
//   identification: Array<string>;
//   verificationStatus: EVerificationStatus;
//   isVerified: boolean;
//   verifiedAt: Date | null;
//   permissions: Array<string>;
//   twoFactorEnabled: boolean;
//   lastLogin: Date;
//   devices: Array<{ deviceId: string; deviceType: string; lastUsed: Date }>;
//   isActive: boolean;
//   isSuspended: boolean;
//   isDeleted: boolean;

//   // Account Managers
//   accountManagers: Array<{ userId: ObjectId; role: EAccountManagerRole }>;

//   // relationships
//   user: ObjectId;
//   transactions: Array<ObjectId>;
//   createdBy: ObjectId;
//   settings: ObjectId;


//creator profile dto
//   // Content
//   description: string;
//   bites: Array<ObjectId>;
//   topBites: Array<ObjectId>;

//   // Followers & Listeners
//   followers: Array<ObjectId>;
//   monthlyListeners: number;
//   likes: number;
//   shares: number;

//   // Uploads & Publications
//   uploads: Array<ObjectId>;
//   uploadHistory: Array<ObjectId>;
//   publishedCount: number;

//   // Security & Verification
//   identification: Array<string>;
//   verificationStatus: EVerificationStatus;
//   isVerified: boolean;
//   verifiedAt: Date | null;
//   permissions: Array<string>;
//   twoFactorEnabled: boolean;
//   lastLogin: Date;
//   devices: Array<{ deviceId: string; deviceType: string; lastUsed: Date }>;
//   isActive: boolean;
//   isSuspended: boolean;
//   isDeleted: boolean;

//   // Account Managers
//   accountManagers: Array<{ userId: ObjectId; role: EAccountManagerRole }>;

//   // relationships
//   user: ObjectId;
//   transactions: Array<ObjectId>;
//   createdBy: ObjectId;
//   settings: ObjectId;


//staff profile dto
//   // Staff Role & Access
//   unit: EStaffUnit;
//   role: EStaffRole;
//   accessLevel: number;
//   permissions: Array<EStaffPermissions>;

//   // API & Security
//   apiKeys: Array<{ key: string; createdAt: Date; lastUsed: Date }>;
//   ipWhitelist: Array<string>;
//   twoFactorEnabled: boolean;
//   lastLogin: Date;
//   devices: Array<{ deviceId: string; deviceType: string; lastUsed: Date }>;

//   // Actions & Moderation
//   actionsTaken: Array<{ action: string; targetId: string; timestamp: Date }>;
//   moderatedContent: Array<ObjectId>;

//   // Uploads & Publications
//   uploads: Array<ObjectId>;
//   uploadHistory: Array<ObjectId>;
//   publishedCount: number;

//   // Security & Verification
//   identification: Array<string>;
//   verificationStatus: EVerificationStatus;
//   isVerified: boolean;
//   verifiedAt: Date | null;
//   isActive: boolean;
//   isSuspended: boolean;
//   isDeleted: boolean;

//   // relationships
//   user: ObjectId;
//   createdBy: ObjectId;
//   settings: ObjectId;
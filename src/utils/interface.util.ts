import { Model } from "mongoose";
import { Document, ObjectId } from "mongoose";

export type Nullable<T> = T | null;
export interface IRoleDoc extends Document {
  name: string;
  description: string;
  slug: string;
  user: ObjectId | any;
  permissions: Array<string>;

  getAll(): Array<IRoleDoc>;
  findByName(name: string): Nullable<IRoleDoc>;
  
  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface IUserDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  country: string;
  phoneNumber: string;
  phoneCode: string;

  dateOfBirth: Date;
  gender: string;
  profileImage: string;
  passwordType: string;
  savedPassword: string;
  userType: string;

  activationCode: string;
  activationCodeExpirationDate: Date;
  accessToken: string;
  accessTokenExpirationDate: Date;
  resetOTP: string;
  resetOTPExpirationDate: Date;
  forgotOTP: string;
  forgotOTPExpirationDate: Date;

  subscriptionType: string;
  subscriptionStatus: string;

  playlists: Array<string>;
  likedSermons: Array<string>;
  savedSermonBites: Array<string>;
  favoritePreachers: Array<string>;
  following: Array<string>;
  notifications: Array<string>;

  login: {
    lastLogin: Date;
    ip: string;
    deviceType: string;
  };

  emailCode: string;
  emailCodeExpire: Date | number;

  isActivated: boolean;
  isSuper: string;
  isAdmin: string;
  isCreator: string;
  isUser: string;

  isActive: boolean;
  loginLimit: number;
  isLocked: boolean;
  lockedUntil: Nullable<Date>;
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
  user: string;
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

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}
export interface IPagination {
  total: number;
  count: number;
  pagination: {
    next: { page: number; limit: number };
    prev: { page: number; limit: number };
  };
  data: Array<any>;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}
export interface IPreacher extends Document {
  name: string;
  bio: string;
  churchName: string;
  profileImage: string;
  sermons: Array<string>;
  bites: Array<string>;
  followers: Array<string>;
  topSermons: Array<string>;
  topBites: Array<string>;
  monthlyListeners: number;
 
  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface ICatalog extends Document {
  type: "Sermon" | "Bite" | "Preacher";
  sermon?: string; // Sermon ID
  bite?: string; // Sermon bite ID
  preacher?: string; // Preacher ID
  title: string;
  category: string;
  isTrending: boolean;
  tags: string[];

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface IStreaming extends Document {
  user: string; // User ID
  sermon: string; // Sermon ID
  status: "Playing" | "Paused" | "Stopped";
  lastPosition: number; // Timestamp (seconds)
  duration: number; // Total sermon duration
  deviceType: "Mobile" | "Web" | "Tablet" | "TV";
  deviceId: string;
  queue: string[]; // Array of sermon IDs in queue
  currentIndex: number; // Current position in queue
  quality: "Low" | "Medium" | "High";
  playbackSpeed: 0.5 | 1 | 1.5 | 2;
  repeatMode: "None" | "One" | "All";
  shuffle: boolean;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface ISermon extends Document {
  title: string;
  preacher: string; // Preacher ID
  collection?: string; // Collection/Series ID
  description: string;
  duration: number; // In seconds
  category: string;
  sermonURL: string;
  tags: string[];
  date: Date;
  playCount: number;
  shareCount: number;
  playlist: string[]; // Playlist IDs where this sermon is added
  library: string[]; // User IDs who saved this sermon

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface ISermonBite extends Document {
  title: string;
  preacher: string; // Preacher ID
  sermon: string; // Sermon ID
  duration: number; // In seconds
  category: string;
  biteURL: string;
  tags: string[];
  date: Date;
  playCount: number;
  shareCount: number;
  playlist: string[]; // Playlist IDs where this sermon bite is added
  library: string[]; // User IDs who saved this sermon bite

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface ISubscription extends Document {
  code: string;
  isPaid: boolean;
  status: string;
  slug: string;
  billing: {
    amount: number;
    startDate: Date;
    paidDate: Date;
    dueDate: Date;
    graceDate: Date;
    interval: string;
  };

  // relationships
  user: ObjectId | any;
  transaction: Array<ObjectId | any>;
  plan: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

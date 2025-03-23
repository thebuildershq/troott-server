import { Model } from "mongoose";
import { Document, ObjectId } from "mongoose";
import { playlistType, TransactionsType, UserType } from "./enums.util";

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
  avatar: string;
  passwordType: string;
  savedPassword: string;
  userType: UserType;

  activationCode: string;
  activationCodeExpirationDate: Date;
  accessToken: string;
  accessTokenExpirationDate: Date;
  resetOTP: string;
  resetOTPExpirationDate: Date;
  forgotOTP: string;
  forgotOTPExpirationDate: Date;
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
  isListener: true;
  isUser: true;

  isActive: boolean;
  loginLimit: number;
  isLocked: boolean;
  lockedUntil: Nullable<Date>;
  lastLogin: Date;

  // relationships
  roles: Array<ObjectId | any>;

  sermonHistory: Array<ISermonDoc>;
  biteHistory: Array<ISermonBiteDoc>;
  playlists: Array<ObjectId | any>;
  likedSermons: Array<string>;
  savedSermonBites: Array<string>;
  favoritePreachers: Array<string>;
  following: Array<string>;
  notifications: Array<string>;

  //systems & permissions

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

export interface IListenerProfile {

  listenerID: string;
  firstName: string;
  lastName: string;
  email: string;

  gender: string;
  dateOfBirth: Date;
  phoneNumber: string;
  phoneCode: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  slug: string;
  type: string;
  card: IDebitCard;
  invoices: Array<string>

  //relationships
  user: ObjectId | any;
  subscription: ObjectId | any;
  transactions: Array<ObjectId | any>;
  createdBy: ObjectId | any;
  settings: ObjectId | any;

  // time stamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IPreacher extends Document {
  // timestamps
  createdAt: string;
  updatedAt: string;

}

export interface ICreatorProfile {
  
  creatorID: string
  bio: string;
  ministry: string;
  
  sermons: Array<string>;
  bites: Array<string>;
  followers: Array<string>;
  topSermons: Array<string>;
  topBites: Array<string>;
  monthlyListeners: number;

  uploads: string;
  published: string;
  isVerfied: boolean;

  identification: string;
  historyUpload: string;

  revenue: Array<number>;

  //relationships
  user: ObjectId | any;
  createdBy: ObjectId | any;
  settings: ObjectId | any;

  // time stamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IStaffProfile {
  apiKeys: string;

  //relationships
  user: ObjectId | any;
  createdBy: ObjectId | any;
  settings: ObjectId | any;

  // time stamps
  createdAt: string;
  updatedAt: string;
  _version: number;
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

export interface ISermonDoc extends Document {
  title: string;
  theme?: string; 
  description: string;
  duration: number; // In seconds
  category: string;
  sermonURL: string;
  tags: Array<string>;
  //date: Date;
  playCount: number;
  shareCount: number;
  sermonType: string;

  // relatiionships
  creator: ObjectId | any;
  playlist: ObjectId | any;
  library: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface ISermonType {
  title: string;
  description: string;
  category: string;
  theme: string;
  part: Array<string>;
  coverImage: string;
  duration: string;
}

export interface ISermonBiteDoc extends Document {
  title: string;
  preacher: string; // Preacher ID
  sermon: string; // Sermon ID
  duration: number; // In seconds
  category: string;
  biteURL: string;
  tags: Array<string>;
  date: Date;
  playCount: number;
  shareCount: number;
  playlist: Array<string>;
  library: Array<string>;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface IPlaylist extends Document {

  title: string;
  description: string;
  imageURL: string;
  type: playlistType;
  isDefault: boolean;
  isPublic: boolean;

  // relationships
  user: ObjectId | any;
  sermon: ObjectId | any;
  bites: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface ITransactions extends Document {
  type: TransactionsType;
  medium: string;
  resource: string;
  entity: string;
  referenece: string;
  currency: string;
  providerRef: string;
  providerName: string;
  description: string;
  narration: string;
  amount: string;
  unitAmount: string; // kobo unit * 100
  fee: number;
  unitFee: number; // kobo unit * 100
  status: string;
  reason: string;
  message: string;
  providerData: string;
  metadata: Array<any>;
  channel: string;
  slug: string;
  card: IDebitCard;

  // relationships
  user: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _versions: number;
  _id: ObjectId;
  id: ObjectId;

  // functions
  getAll(): Array<ITransactions>;
}
export interface ISubscriptionDoc extends Document {
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
    frequency: string;
  };

  // relationships
  user: ObjectId | any;
  transactions: Array<ObjectId | any>;
  plan: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _versions: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IPlanDoc extends Document {
  name: string;
  isEnabled: boolean;
  description: string;
  label: string;
  currency: string;
  code: string;
  pricing: IPlanPricing;
  trial: IPlanTrial;
  slug: string;

  sermon: IPlanSermon;
  sermonBite: IPlanSermonBite;

  //relationships
  user: ObjectId | any;

  //timestamps
  createdAt: string;
  updatedAt: string;
  _versions: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IPlanPricing {
  monthly: number;
  yearly: number;
  perMonth: number;
}

export interface IPlanTrial {
  isActive: boolean;
  startDate: Date
  endDate: Date
  days: number
}

export interface IPlanSermon {
  limit: {
    value: number;
    frequency: string;
  };
}

export interface IPlanSermonBite {

}
export interface IDebitCard {
  authCode: string; // encrypt this data
  cardBin: string;
  cardLast: string;
  expiryMonth: string;
  expiryYear: string;
  cardPan: string;
}

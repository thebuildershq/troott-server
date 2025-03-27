import { Model, Document, ObjectId } from "mongoose";
import { EBiteState, EBiteStatus, EcatalogueType, EOtpType, EPlaylistType, ESermonState, ESermonStatus, ETransactionsType, EUserType } from "./enums.util";

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
  
  userType: EUserType;

  country: string;
  phoneNumber: string;
  phoneCode: string;

  dateOfBirth: Date;
  gender: string;
  avatar: string;
  passwordType: string;
  savedPassword: string;
  

  activationCode: string;
  activationCodeExpiry: Date;
  accessToken: string;
  accessTokenExpiry: Date;

  passwordOtp: string;
  passwordOtpExpiry: Date;
  otpType: EOtpType

  login: {
    lastLogin: Date;
    ip: string;
    deviceType: string;
  };


  isActivated: boolean;
  isSuper: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  isListener: boolean;
  isUser: boolean;

  isActive: boolean;
  loginLimit: number;
  isLocked: boolean;
  lockedUntil: Nullable<Date>;
  lastLogin: Date;

  // relationships
  roles: Array<ObjectId | any>;
  playlists: Array<ObjectId | any>;
  following: Array<string>;
  notifications: Array<string>;
  favoritePreachers: Array<string>;
  favoriteCreators: Array<string>;

  sermonHistory: Array<ISermonDoc>;
  likedSermons: Array<string>;
  sharedSermons: Array<string>

  biteHistory: Array<ISermonBiteDoc>;
  savedSermonBites: Array<string>;
  sharedSermonBites: Array<string>
  


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

export interface IListenerProfileDoc extends Document {
  listenerId: string;
  firstName: string;
  lastName: string;
  email: string;

  gender: string;
  dateOfBirth: Date;
  phoneNumber: string;
  phoneCode: string;
  location: ILocationInfo;
  slug: string;
  type: string;
  card: IDebitCard;

  //relationships
  user: ObjectId | any;
  subscriptions: Array<ObjectId | any>;
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
export interface IPreacherProfileDoc extends Document {
  preacherId: string;
  description: string;
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

  location: ILocationInfo
  slug: string;

  //relationships
  user: ObjectId | any;
  transactions: Array<ObjectId | any>
  createdBy: ObjectId | any;
  settings: ObjectId | any;

  // time stamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface ICreatorProfileDoc extends Document {
  creatorId: string;
  description: string;
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
  location: ILocationInfo
  slug: string;

  //relationships
  user: ObjectId | any;
  transactions: Array<ObjectId | any>
  createdBy: ObjectId | any;
  settings: ObjectId | any;

  // time stamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IStaffProfileDoc extends Document {
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


export interface ISermonDoc extends Document {
  title: string;
  description: string;
  duration: number; // In seconds
  category: Array<string>
  sermonUrl: string;
  imageURL: string
  tags: Array<string>;
  
  isPublic: boolean
  playCount: ISermonPlayCount;
  shareCount: ISermonShareCount;
  isSeries: boolean
  sermonType: ISermonType;
  state: ESermonState
  status: ESermonStatus

  createdBy:  ObjectId | any;

  // relatiionships
  preacher: ObjectId | any;
  playlist: ObjectId | any;
  library: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _version: number
  _id: ObjectId;
  id: ObjectId;
}
export interface ISermonBiteDoc extends Document {
  title: string;
  description: string;
  duration: number; // In seconds
  category: Array<string>
  biteURL: string;
  thumbnailUrl?: string
  tags: Array<string>;
  
  likes: IBiteLike
  views: IBiteViewHistory;
  shareCount: IBiteShareCount;
  
  saved: IBiteSavedHistory
  state: EBiteState
  status: EBiteStatus

  createdBy:  ObjectId | any;
  
    
  // relationship
  playlist: Array<ObjectId>;
  library: Array<ObjectId>;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _version: number
  _id: ObjectId;
  id: ObjectId;
}

export interface ICatalogDoc extends Document {
  type: EcatalogueType;
  sermon?: string; // Sermon ID`
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

export interface IStreamingDoc extends Document {
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

export interface ILibraryDoc extends Document {
  
}

export interface IPlaylistDoc extends Document {
  title: string;
  description: string;
  imageURL: string;
  type: EPlaylistType;
  totalDuration: string
  isDefault: boolean;
  isPublic: boolean;
  likes: string

  // relationships
  user: ObjectId | any;
  sermon: ObjectId | any;
  bites: ObjectId | any;
  preacher:  ObjectId | any
  listener:  ObjectId | any
  creator:  ObjectId | any

  // timestamps
  createdAt: string;
  updatedAt: string;
  _version: number
  _id: ObjectId;
  id: ObjectId;
}

export interface ITransactionDoc extends Document {
  type: ETransactionsType;
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
  getAll(): Array<ITransactionDoc>;
}
export interface ISubscriptionDoc extends Document {
  code: string;
  isPaid: boolean;
  status: string;
  slug: string;
  billing: IBillingInfo;

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
  slug: string;

  pricing: IPlanPricing;
  trial: IPlanTrial;
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

export interface ILocationInfo {
  address: string;
  city: string;
  state: string;
}

export interface ISermonType {
  title: string;
  description: string;
  part: Array<string>;
  position: string
  imageURL: string;
  toatlDuration: string;
}

export interface IBillingInfo {
  amount: number;
  startDate: Date;
  paidDate: Date;
  dueDate: Date;
  graceDate: Date;
  frequency: string;
}
export interface IPlanPricing {
  monthly: number;
  yearly: number;
  perMonth: number;
}

export interface IPlanTrial {
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  days: number;
}

export interface IPlanSermon {
  limit: {
    value: number;
    frequency: string;
  };
}

export interface IPlanSermonBite {
  limit: {
    value: number;
    frequency: string;
  };
}
export interface IDebitCard {
  authCode: string; // encrypt this data
  cardBin: string;
  cardLast: string;
  expiryMonth: string;
  expiryYear: string;
  cardPan: string; // encrypt this data
  token: string;
  provider: string;
}

export interface ISermonPlayCount {
  userId: ObjectId
  sermonBiteId: ObjectId;
  watchedAt: Date;
}
export interface ISermonLike {
  userId: ObjectId
  sermonBiteId: ObjectId;
  likedAt: Date;
}

export interface ISermonShareCount {
  userId: ObjectId
  sermonBiteId: ObjectId;
  ShareCount: number;
}

export interface IBiteViewHistory {
  userId: ObjectId
  sermonBiteId: ObjectId;
  watchedAt: Date;
}
export interface IBiteLike {
  userId: ObjectId
  sermonBiteId: ObjectId;
  likedAt: Date;
}

export interface IBiteShareCount {
  userId: ObjectId
  sermonBiteId: ObjectId;
  ShareCount: number;
}

export interface IBiteSavedHistory {
  userId: ObjectId
  sermonBiteId: ObjectId;
  saved: string
}
//IViewHistory

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


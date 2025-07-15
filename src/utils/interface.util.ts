import { Model, Document, ObjectId } from "mongoose";
import {
  AccountManagerRole,
  APIKeyEnvironment,
  APIKeyStatus,
  APIKeyType,
  ContentState,
  ContentStatus,
  EmailType,
  OtpType,
  PasswordType,
  PlaylistType,
  StaffPermissions,
  StaffRole,
  StaffUnit,
  TransactionsType,
  UploadStatus,
  UserType,
  VerificationStatus,
  FileType,
  EmailService,
  PaymentProviders,
  OAuthProvider,
} from "./enums.util";
import { IUploadMetadata } from "./types.util";
import { PassThrough } from "stream";
import { FileInfo } from "busboy";

export type Nullable<T> = T | null;
export interface IRoleDoc extends Document {
  name: string;
  description: string;
  slug: string;
  scope?: string;
  scopeId?: string;

  // relationships
  permissions: Array<string>;
  users: Array<ObjectId | any>;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IPermissionDoc extends Document {
  action: string;
  description: string;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IUserDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordType: PasswordType; // encrypt this data
  userType: UserType;

  //user: string;
  phoneNumber: string;
  phoneCode: string;
  country: string;
  countryPhone: string;

  avatar: string;
  dateOfBirth: Date;
  gender: string;
  location: ILocationInfo;

  Otp: string;
  OtpExpiry: number;
  otpType: OtpType;
  accessToken: string;
  accessTokenExpiry: Date;
  tokenVersion: number;

  isSuper: boolean;
  isStaff: boolean;
  isPreacher: boolean;
  isCreator: boolean;
  isListener: boolean;

  isActivated: boolean;
  isDeactivated: boolean;

  loginInfo: ILoginType;
  lastLogin: string;
  isActive: boolean;
  loginLimit: number;
  isLocked: boolean;
  lockedUntil: Nullable<Date>;
  twoFactorEnabled: boolean;

  preferences: {
    topics: Array<string>;
    preacher: Array<ObjectId>;
  };

  // Notification Preferences
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };

  // relationships
  role: ObjectId | any;

  matchPassword: (password: string) => boolean;
  getAuthToken: () => string;

  // time stamps
  createdAt: Date;
  updatedAt: Date;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IListenerDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;

  //user: string;
  phoneNumber: string;
  phoneCode: string;
  country: string;
  countryPhone: string;

  avatar: string;
  dateOfBirth: Date;
  gender: string;
  slug: string;
  card?: IDebitCard;

  // Engagement Tracking
  playlists: Array<ObjectId | any>;
  listeningHistory: Array<ObjectId | any>;
  likedSermons: Array<ObjectId | any>;
  sharedSermons: Array<ObjectId | any>;

  viewedSermonBites: Array<ObjectId | any>;
  sharedSermonBites: Array<ObjectId | any>;
  savedSermonBites: Array<ObjectId | any>;

  followers: Array<ObjectId | any>;
  following: Array<ObjectId | any>;
  interests: Array<string>;
  badges: Array<string>;

  //relationships
  user: ObjectId | any;
  subscriptions: Array<ObjectId | any>;
  transactions: Array<ObjectId | any>;
  createdBy: ObjectId | any;

  // time stamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}
export interface IPreacherDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  //user: string;
  phoneNumber: string;
  phoneCode: string;
  country: string;
  countryPhone: string;

  avatar: string;
  dateOfBirth: Date;
  gender: string;
  slug: string;

  // Ministry & Content
  description: string;
  ministry: string;
  ministryHq: string;

  ministryWebsite: string;
  sermons: Array<ObjectId | any>;
  featuredSermons: Array<ObjectId | any>;
  bites: Array<ObjectId | any>;
  topSermons: Array<ObjectId | any>;
  topBites: Array<ObjectId | any>;

  // Playlist System
  playlists: Array<ObjectId | any>; // Playlists created by the preacher
  featuredPlaylists: Array<ObjectId | any>;

  // Followers & Listeners
  followers: Array<ObjectId | any>;
  monthlyListeners: number;
  likes: number;
  shares: number;

  // Uploads & Publications
  uploads: Array<ObjectId | any>;
  uploadHistory: Array<ObjectId | any>;

  // Security & Verification
  identification: Array<string>;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  verifiedAt: Date;

  // Account Managers
  accountManagers: Array<{ userId: ObjectId; role: AccountManagerRole }>;

  //relationships
  user: ObjectId | any;
  transactions: Array<ObjectId | any>;
  createdBy: ObjectId | any;
  deletedSermons: Array<{
    id: ObjectId;
    deletedBy: ObjectId | any;
    deletedAt: Date;
    reason?: string;
  }>;

  // time stamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}
export interface ICreatorDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;

  //user: string;
  phoneNumber: string;
  phoneCode: string;
  country: string;
  countryPhone: string;

  avatar: string;
  dateOfBirth: Date;
  gender: string;
  slug: string;

  // Content
  description: string;
  bites: Array<ObjectId | any>;
  topBites: Array<ObjectId | any>;

  // Followers & Listeners
  followers: Array<ObjectId | any>;
  monthlyListeners: number;
  likes: number;
  shares: number;

  // Uploads & Publications
  uploads: Array<ObjectId | any>;
  uploadHistory: Array<ObjectId | any>;

  // Security & Verification
  identification: Array<string>;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  verifiedAt: Date | null;

  // Account Managers
  accountManagers: Array<{ userId: ObjectId; role: AccountManagerRole }>;

  //relationships
  user: ObjectId | any;
  transactions: Array<ObjectId | any>;
  createdBy: ObjectId | any;

  // time stamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IStaffDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;

  //user: string;
  phoneNumber: string;
  phoneCode: string;
  country: string;
  countryPhone: string;

  avatar: string;
  dateOfBirth: Date;
  gender: string;
  slug: string;

  // Staff Role & Access
  unit: StaffUnit;
  role: StaffRole;
  accessLevel: number;
  permissions: Array<StaffPermissions>;

  // API & Security
  apiKeys: Array<{ key: string; createdAt: Date; lastUsed: Date }>; // encrypt this data
  ipWhitelist: Array<string>;

  // Actions & Moderation
  actionsTaken: Array<{ action: string; targetId: string; timestamp: Date }>;
  moderatedContent: Array<ObjectId>;

  // Uploads & Publications
  uploads: Array<ObjectId | any>;
  uploadHistory: Array<ObjectId | any>;
  publishedCount: number;

  // Security & Verification
  identification: Array<string>;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  verifiedAt: Date | null;

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

export interface ISermonDoc extends Document {
  title: string;
  description: string;
  duration: number;
  releaseDate: Date;
  releaseYear: number;
  sermonUrl: string;
  imageUrl: string;
  size: number;

  topic: string;
  tags: Array<string>;
  isPublic: boolean;
  shareableUrl: string;

  isSeries: boolean;
  series: Array<ObjectId>;

  totalPlay: ISermonPlayCount;
  totalLikes: ISermonLike;
  totalShares: ISermonShareCount;
  state: ContentState;
  status: ContentStatus;

  // Uplaod Tracking
  uploadRef?: ObjectId | any;
  uploadSummary?: {
    fileName: string;
    fileSize: number;
    mimetype: string;
    s3Key: string;
    s3Url: string;
    metadata: Extract<IUploadMetadata, IAudioMetadata>;
    uploadedBy: ObjectId;
  };

  //Modifications
  versionId?: ObjectId;
  changesSummary: string;

  // relatiionships
  preacher: ObjectId | any;
  playlist: ObjectId | any;
  publishedBy: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IUploadDoc extends Document {
  uploadId: string;
  fileName: string;
  fileSize: number;
  mimetype: string;
  fileType: FileType;

  s3Key: string;
  s3Url: string;
  metadata: IUploadMetadata;
  status: UploadStatus;
  uploadedBy: ObjectId;

  //processing
  chunkSize: number;
  totalChunks: number;
  completedChunks: number;
  multipartUploadId?: string;
  retryCount: number;
  lastChunkUploadedAt?: Date;
  expiresAt: Date;
  error?: string;

  //timestamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IAudioMetadata {
  metadataType: FileType.AUDIO;
  formatName?: string;
  codec?: string;
  duration?: number;
  bitrate?: number;
  year?: number;
}

export interface IImageMetadata {
  metadataType: FileType.IMAGE;
  width?: number;
  height?: number;
  format?: string;
}

export interface IDocumentMetadata {
  metadataType: FileType.DOCUMENT;
  pageCount?: number;
  author?: string;
  title?: string;
  language?: string;
}

export interface IVideoMetadata {
  metadataType: FileType.VIDEO;
  duration?: number;
  resolution?: string;
  codec?: string;
  framerate?: number;
}

export interface ISermonBiteDoc extends Document {
  title: string;
  description: string;
  duration: number; // In seconds
  category: Array<string>;
  biteURL: string;
  thumbnailUrl?: string;
  tags: Array<string>;

  // Engagement & Analytics
  engagementStats: IBiteEngagementStats;
  viewHistory: Array<IBiteViewHistory>;
  likeHistory: Array<IBiteLike>;
  shareHistory: Array<IBiteShareHistory>;
  savedHistory: Array<IBiteSavedHistory>;

  // State Management
  isPublic: boolean;
  state: ContentState;
  status: ContentStatus;

  // Modifications
  versionId?: ObjectId;
  modifiedAt: string;
  modifiedBy: ObjectId | any;
  changesSummary: string;
  deletedBites: Array<{
    id: ObjectId;
    deletedBy: ObjectId | any;
    deletedAt: string;
    reason?: string;
  }>;

  // relationship
  preacher: ObjectId | any;
  creator: ObjectId | any;
  staff: ObjectId | any;
  playlist: Array<ObjectId>;
  library: Array<ObjectId>;
  createdBy: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface ISeriesDoc extends Document {
  title: string;
  description: string;
  preacher: ObjectId | any;
  sermons: Array<ObjectId | any>;
  imageUrl?: string;
  part: string;
  totalDuration: string;
  tags: Array<string>;

  isPublic: boolean;
  state: ContentState;
  status: ContentStatus;

  // Engagement & Analytics
  totalPlay: number;
  totalShares: number;
  totalLikes: number;

  // Modifications
  versionId?: ObjectId;
  modifiedAt: Date;
  modifiedBy: ObjectId | any;
  changesSummary: string;
  deletedSeries: Array<{
    id: ObjectId;
    deletedBy: ObjectId | any;
    deletedAt: Date;
    reason?: string;
  }>;

  // Relationships

  staff: ObjectId | any;
  createdBy: ObjectId | any;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface ILibraryDoc extends Document {
  user: ObjectId | any;
  likedSermons: Array<ObjectId | any>; //default
  savedBtes: Array<ObjectId | any>; // default
  playlists: Array<ObjectId | any>;
  favouritePreachers: Array<ObjectId | any>; // default (capture 5 preachers from onboarding)
  mostPlayed: Array<ObjectId | any>;

  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface IPlaylistDoc extends Document {
  title: string;
  description: string;
  playlistCover: string;
  totalDuration: string;
  isCollaborative: boolean;
  isPublic: boolean;
  likes: number;
  playlistType: PlaylistType;
  items: Array<{ itemId: ObjectId | any; type: PlaylistType }>;

  // relationships
  user: ObjectId | any;
  createdBy: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: ObjectId;
  id: ObjectId;
}

export interface ITransactionDoc extends Document {
  type: TransactionsType;
  medium: string;
  resource: string;
  entity: string;
  reference: string;
  currency: string;
  providerRef: string;
  providerName: string;
  description: string;
  narration: string;
  amount: number;
  unitAmount: number; // kobo unit * 100
  fee: number;
  unitFee: number; // kobo unit * 100
  status: string;
  reason: string;
  message: string;
  providerData: Array<Record<string, any>>;
  metadata: Array<Record<string, any>>;
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
  metadata: {
    lastBillingDate: Date;
    nextBillingDate: Date;
    billingCycle: string;
    autoRenew: boolean;
    cancelledAt?: Date;
    cancelReason?: string;
    upgradedFrom?: string;
    downgradedFrom?: string;
    promotionCode?: string;
    promotionExpiry?: Date;
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
export interface IAPIKeyDoc extends Document {
  keyHash: string;
  environment: APIKeyEnvironment;
  type: APIKeyType;
  status: APIKeyStatus;
  permissions: Array<string>;
  expiresAt: string;
  revokedAt?: string;
  revokedBy?: string;
  description?: string;

  // relationships
  staff: ObjectId | any;

  // timestamps
  createdAt: string;
  updatedAt: string;
  _id: ObjectId;
  id: ObjectId;
}

export interface IDeviceToken {
  token: string;
  platform: "ios" | "android" | "web";
  lastUsed: Date;
}
export interface ILoginType {
  ip: string;
  deviceType: string;
  platform: "web" | "mobile" | "tablet";
  deviceInfo: {
    manufacturer?: string; // For mobile devices
    model?: string; // For mobile devices
    osName: string; // iOS, Android, Windows, macOS, etc.
    osVersion: string;
    browser?: string; // For web access
    browserVersion?: string;
    appVersion?: string; // For mobile app
  };
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
}

export interface ILocationInfo {
  address: string;
  city: string;
  state: string;
}

export interface ISeries {
  title: string;
  description: string;
  part: Array<string>;
  position: string;
  imageURL?: string;
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

export interface IPaymentMethod {
  email: string;
  type: string;
  card?: IDebitCard;
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
  userId: ObjectId;
  playedAt: Date;
}

export interface ISermonShareCount {
  userId: ObjectId;
  shareedAt: Date;
}
export interface ISermonLike {
  userId: ObjectId;
  likedAt: Date;
}

export interface IBiteViewHistory {
  userId: ObjectId;
  watchedAt: Date;
}
export interface IBiteLike {
  userId: ObjectId;
  likedAt: Date;
}

export interface IBiteShareHistory {
  userId: ObjectId;
  ShareCount: number;
}

export interface IBiteSavedHistory {
  userId: ObjectId;
  saved: boolean;
  savedAt: Date;
}

export interface IBiteEngagementStats {
  totalLikes: number;
  totalShares: number;
  totalViews: number;
  totalSaves: number;
  avgWatchTime: number; // Average watch duration in seconds
  completionRate: number; // % of people who finished watching
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

export interface IResult<T = any> {
  error: boolean;
  message: string;
  code: number;
  data: any;
}

export interface IBulkUser {
  _id: ObjectId | null | string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  phoneCode: string;
  userType: string;
}

export interface ILogin {
  email: string;
  password: string;
  code: string;
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

export interface IAPIKeyUsage {
  keyHash: string;
  timestamp: Date;
  endpoint: string;
  ipAddress: string;
  userAgent: string;
  responseCode: number;
}

export interface IEmailRequest {
  recipient: string;
  subject: string;
  content: any;
  type: EmailType;
  template?: string;
  attachments?: any[];
}

export interface IEmailPreferences {
  marketing: boolean;
  productUpdates: boolean;
  featureAnnouncements: boolean;
  subscriptionStatus: string;
}

export interface ISensitiveData {
  card?: IDebitCard;
  providerRef: string;
  providerData: Array<Record<string, any>>;
}

export interface ICustomResponse<T> extends Response {
  customResults?: {
    success: boolean;
    count: number;
    total: number;
    pagination: {
      next?: { page: number; limit: number };
      prev?: { page: number; limit: number };
    };
    data: T[];
  };
  status: any;
}

export interface ICursorResponse<T> extends Response {
  customResults: {
    success: boolean;
    count: number;
    nextCursor: string | null;
    data: T[];
  };
}

export interface IcreatedAt {
  createdAt: Date;
}

export interface IQueryOptions {
  limit?: number;
  skip?: number;
  sort?: string;
  populate?: string;
  recentOnly?: boolean;
}

export interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export interface EmailConfig {
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  service: EmailService;
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  templateId?: string;
  isTestMode?: boolean;
  sendingDomain?: string;
  clientUrl?: string;
}

export interface PaymentConfig {
  provider: PaymentProviders;
  secretKey: string;
  publicKey: string;
  webhookSecret?: string;
  isTestMode: boolean;
}

export interface FrontendURLConfig {
  baseUrl: string;
  apiUrl?: string;
  paymentRedirectUrl?: string;
  dashboardUrl?: string;
}

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface OAuthProvidersConfig {
  google: OAuthConfig;
  github: OAuthConfig;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface IEmailJob {
  user: IUserDoc;
  subject: string;
  payload: Record<string, any>;
  driver: EmailService;
  template?: string;
  code?: string;
  metadata?: any;
  options?: {
    subject?: string;
    salute?: string;
    buttonUrl?: string;
    buttonText?: string;
    emailBody?: string;
    emailBodies?: Array<string>;
    bodyOne?: string;
    bodyTwo?: string;
    bodyThree?: string;
    otpType?: OtpType;
    status?: string;
  };
}

export interface IUploadFile {
  stream?: PassThrough;
  metadataStream?: PassThrough;
  info?: FileInfo;
  mimeType?: string;
  fileName?: string;
  fieldname?: string;
  size?: number;
  fileType?: FileType;
  uploadId?: string;
}

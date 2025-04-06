export enum EENVType {
  PRODUCTION = "production",
  STAGING = "staging",
  DEVELOPMENT = "development",
}

export enum EAppChannel {
  WEB = "web",
  MOBILE = "mobile",
  DESKTOP = "desktop",
  WATCH = "watch",
}

// create passwordType: EPasswordType;

export enum EPasswordType {
  USERGENERATED = "user-generated",
  SYSTEMGENERATED = "system-generated",
    TEMPORARY = 'temporary',
  RESET = 'reset'
}

export enum EUserType {
  SUPERADMIN = "superadmin",
  STAFF = "staff",
  PREACHER =  "preacher",
  CREATOR = "creator",
  LISTENER = "listener",
  USER = "user",
}

export enum EStaffUnit {
  ENGINEERING = "engineering",
  PRODUCT = "product",
  DESIGN = "design",
  OPERATIONS = "operations",
  FINANCE = "finance"
}

export enum EStaffRole {
  HEAD = "head",
  MANAGER = "manager",
  LEAD = "lead",
  ASSOCIATE = "assocaite",
  JUNIOR = "junior"
}

export enum EAccountManagerRole {
  OWNER = "owner",
  MANAGER = "manager",
  EDITOR = "editor",
  ANALYST = "analyst",
}


export enum EVerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  UNDER_REVIEW = "under-review",
  NEEDS_REVISION = "needs-revision",
  SUSPENDED = "suspended",
}

export enum EDbModels {
  USER = "User",
  ROLE = "Role",
  BITE = "bite",
  CATALOG = "catalog",
  CREATOR = "creator",
  LIBRARY = "library",
  LISTENER = "listener",
  PLAN = "plan",
  PLAYLIST = "playlist",
  PREACHER = "preacher",
  SUBSCRIPTION = "subscription",
  SERIES = "series",
  SERMON = "sermon",
  STAFF = "staff",
  TRANSACTION = "transaction",
}

export enum EModel {
  USER = "User",
  ROLE = "Role",
}

export enum ESermonType {
  SERIES = "series",
  ONEOFF = "one-off",
}

export enum EPartType {
  ONE = "one",
  TW0 = "two",
  THREE = "three",
  FOUR = "four",
  FIVE = "five",
  SIX = "six",
  SEVEN = "seven",
}

export enum EPlaylistType {
  SERMON = "sermon",
  SERMONBITE = "sermonbite",
}

export enum ECurrency {
  NGN = "NGN",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  AUD = "AUD",
  CAD = "CAD",
  CHF = "CHF",
  CNY = "CNY",
  INR = "INR",
  ZAR = "ZAR",
}

export enum EProviders {
  PAYSTACK = "Paystack",
  FLUTTERWAVE = "Flutterwave",
  STRIPE = "Stripe",
  PAYPAL = "PayPal",
  SQUARE = "Square",
  ALIPAY = "Alipay",
  WECHAT_PAY = "WeChat Pay",
}

export enum ESubcriptionType {
  FREE = "free",
  TRIAL = "trial",
  PREMIUM = "premium",
  FAMILY = "family",
  STUDENT = "student",
}

export enum ESubscriptionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum ETransactionsType {
  CREDIT = "credit",
  DEBIT = "debit",
  DEFAULT = "default",
}

export enum ETransactionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  FAILED = "failed",
  SUCCESSFUL = "successful",
  REFUNDED = "refunded",
  DEFAULT = "default",
}

export enum ETransactionReason {
  PENDING = "pending",
  ABANDONED = "abandoned",
  FRAUDULENT = "fraudulent",
  REFUNDED = "refunded",
  COMPLETED = "completed",
  FAILED = "failed",
  ONGOING = "ongoing",
  CANCELLED = "cancelled",
  DEFAULT = "default",
}

export enum EdeviceType {
  ANDROID = "android",
  IOS = "ios",
}

export enum EOtpType {
  CHANGEPASSWORD = "change-password",
  FORGOTPASSWORD = "forgot-password",
}

export enum EContentState {
  UPLOADING = "uploading",
  PROCESSING = "processing",
  PROCESSED = "processed", 
  UPLOADED = "uploaded", 
  FAILED = "failed",
  RETRYING = "retrying",
}

export enum EContentStatus {
  PUBLISHED = "published",
  PENDING_REVIEW = "pending_review",
  DRAFT = "draft",
  FLAGGED = "flagged",
  DELETED = "deleted",
  ARCHIVED = "archived",
}


export enum EcatalogueType {
  RECENTLYPLAYED = "sermon",
  BITE = "bite",
  P = "Preacher",
}

export enum EStaffPermissions {
  Moderate = "moderate",
  Create = "create",
  ManageUsers = "manageUsers",
  ManagePlaylists = "managePlaylists",
  TrackEngagement = "trackEngagement",
  FullAccess = "fullAccess"
}


;
export enum EEmailDriver {
  SENDGRID = "sendgrid",
  AWS = "aws",
  MAILTRAP = "mailtrap",
}
export enum EEmailTemplate {
  WELCOME = "welcome",
  PASSWORD_RESET = "password-reset",
  PASSWORD_CHANGED = "password-changed",
  EMAIL_VERIFICATION = "email-verification",
  INVITE = "invite",
  OTP = "otp",
  VERIFY_EMAIL = "verify-email",
}
export enum EEmailStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  BOUNCED = "bounced",
  SPAM = "spam",
  UNSUBSCRIBED = "unsubscribed",
  FAILED = "failed",
  PENDING = "pending",
  ERROR = "error",
  DELAYED = "delayed",
  QUEUED = "queued",
  REJECTED = "rejected",
  BLOCKED = "blocked",
  INVALID = "invalid",
  BLACKLISTED = "blacklisted",
  COMPLAINED = "complained",
  DEFERRED = "deferred",
  UNDELIVERED = "undelivered",
  TEMPORARY_FAILURE = "temporary-failure",
  PERMANENT_FAILURE = "permanent-failure",
  TIMEOUT = "timeout",
  RETRY = "retry",
  UNKNOWN = "unknown",
  SUCCESS = "success",
  FAILURE = "failure",
}


export enum EVerifyOTP {
  REGISTER = "register",
  PASSWORD_RESET = "password-reset",
  CHANGE_PASSWORD = "change-password",
  LOGIN = "login",
  VERIFY = "verify",
}



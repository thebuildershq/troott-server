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

export enum EUserType {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  CREATOR = "creator",
  LISTENER = "listener",
  USER = "user",
}

export enum EDbModels {
  USER = "User",
  ROLE = "Role",
  CATALOG = "Catalog",
  PLAYLIST = "Playlist",
  SERMON = "Sermon",
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

export enum EBiteState {
  UPLOADING = "uploading",
  PROCESSING = "processing",
  PROCESSED = "processed", 
  UPLOADED = "uploaded", 
  FAILED = "failed",
  RETRYING = "retrying",
}

export enum ESermonStatus {
  PUBLISHED = "published",
  DRAFT = "draft",
  FLAGGED = "flagged",
  DELETED = "deleted",
}

export enum ESermonState {
  UPLOADING = "uploading",
  PROCESSING = "processing",
  PROCESSED = "processed", 
  UPLOADED = "uploaded", 
  FAILED = "failed",
  RETRYING = "retrying",
}

export enum EBiteStatus {
  PUBLISHED = "published",
  DRAFT = "draft",
  FLAGGED = "flagged",
  DELETED = "deleted",
}

export enum EcatalogueType {
  SERMON = "sermon",
  BITE = "bite",
  P = "Preacher",
}
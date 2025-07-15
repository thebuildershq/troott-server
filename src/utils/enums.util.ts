export enum ENVType {
  PRODUCTION = "production",
  STAGING = "staging",
  DEVELOPMENT = "development",
}

export enum AppChannel {
  WEB = "web",
  MOBILE = "mobile",
  DESKTOP = "desktop",
  WATCH = "watch",
}

// create passwordType: EPasswordType;

export enum PasswordType {
  USERGENERATED = "user-generated",
  SYSTEMGENERATED = "system-generated",
  TEMPORARY = "temporary",
  RESET = "reset",
}

export enum UserType {
  SUPERADMIN = "superadmin",
  STAFF = "staff",
  PREACHER = "preacher",
  CREATOR = "creator",
  LISTENER = "listener",
  USER = "user",
}

export enum StaffUnit {
  ENGINEERING = "engineering",
  PRODUCT = "product",
  DESIGN = "design",
  OPERATIONS = "operations",
  FINANCE = "finance",
}

export enum StaffRole {
  HEAD = "head",
  MANAGER = "manager",
  LEAD = "lead",
  ASSOCIATE = "assocaite",
  JUNIOR = "junior",
}

export enum AccountManagerRole {
  OWNER = "owner",
  MANAGER = "manager",
  EDITOR = "editor",
  ANALYST = "analyst",
}

export enum VerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  UNDER_REVIEW = "under-review",
  NEEDS_REVISION = "needs-revision",
  SUSPENDED = "suspended",
}

export enum DbModels {
  USER = "user",
  ROLE = "role",
  PERMISSION = "permission",
  API_KEY = "ApiKey",
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
  UPLOAD = "upload",
}

export enum SermonType {
  SERIES = "series",
  ONEOFF = "one-off",
}

export enum FileType {
  AUDIO = "audio",
  DOCUMENT = "document",
  IMAGE = "image",
  VIDEO = "video",
}

export enum PartType {
  ONE = "one",
  TW0 = "two",
  THREE = "three",
  FOUR = "four",
  FIVE = "five",
  SIX = "six",
  SEVEN = "seven",
}

export enum PlaylistType {
  DEFAULT = "default",
  SERIES = "series",
  PREACHER = "preacher",
  CATEGORY = "category",
  SERMON = "sermon",
  SERMONBITE = "sermonbite",
}

export enum Currency {
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

export enum PaymentProviders {
  PAYSTACK = "Paystack",
  FLUTTERWAVE = "Flutterwave",
  STRIPE = "Stripe",
  PAYPAL = "PayPal",
  SQUARE = "Square",
  ALIPAY = "Alipay",
  WECHAT_PAY = "WeChat Pay",
}

export enum SubcriptionPlan {
  FREE = "free",
  TRIAL = "trial",
  PREMIUM = "premium",
  FAMILY = "family",
  STUDENT = "student",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  TRIAL = "trial",
}

export enum BillingFrequency {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum TransactionsType {
  SUBSCRIPTION = "subscription",
  REFUND = "refund",
  ONETIME = "onetime",
  UPGRADE = "upgrade",
  PAYMENT_METHOD_UPDATE = "payment-method-update",
}

export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
  DEFAULT = "default",
}

export enum TransactionStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  FAILED = "failed",
  SUCCESSFUL = "successful",
  REFUNDED = "refunded",
  DEFAULT = "default",
  EXPIRED = "expired",
}

export enum TransactionReason {
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

export enum DeviceType {
  ANDROID = "android",
  IOS = "ios",
}

export enum OtpType {
  REGISTER = "register",
  LOGIN = "login",
  VERIFY = "verify",
  GENERIC = "generic",
  PASSWORD_RESET = "password-reset",
  ACTIVATEACCOUNT = "activate-account",
  CHANGEPASSWORD = "change-password",
  FORGOTPASSWORD = "forgot-password",
}


export enum UploadStatus {
  PENDING = "pending",
  UPLOADING = "uploading",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  EXPIRED = "expired",
}

export enum ChunkStatus {
  PENDING = "pending",
  UPLOADED = "uploaded",
  FAILED = "failed",
}

export enum ProcessingStatus {
  QUEUED = "queued",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum ContentType {
  SERMON = "sermon",
  BITE = "bite",
}

export enum ContentState {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DELETED = "deleted",
  BROKEN = "broken",
}

export enum ContentStatus {
  PUBLISHED = "published",
  DRAFT = "draft",
  FLAGGED = "flagged",
  DELETED = "deleted",
  ARCHIVED = "archived",
}

export enum CatalogueType {
  RECENTLYPLAYED = "sermon",
  BITE = "bite",
  P = "Preacher",
}

export enum StaffPermissions {
  Moderate = "moderate",
  Create = "create",
  ManageUsers = "manageUsers",
  ManagePlaylists = "managePlaylists",
  TrackEngagement = "trackEngagement",
  FullAccess = "fullAccess",
}

export enum EmailService {
  SENDGRID = "sendgrid",
  AWS_SES = "ses",
  MAILTRAP = "mailtrap",
  MAILGUN = "mailgun",
  MAILSEND = "mailsend",
  SMTP = "smtp"
}
export enum EmailTemplate {
  WELCOME = "welcome",
  USER_INVITE = "user-invite",
  PASSWORD_RESET = "password-reset",
  PASSWORD_CHANGED = "password-changed",
  EMAIL_VERIFICATION = "email-verification",
  INVITE = "invite",
  OTP = "otp",
  VERIFY_EMAIL = "verify-email",
}
export enum EmailStatus {
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

export enum APIKeyEnvironment {
  LIVE = "live",
  TEST = "test",
}

export enum APIKeyStatus {
  ACTIVE = "active",
  REVOKED = "revoked",
  EXPIRED = "expired",
  SUSPENDED = "suspended",
}

export enum APIKeyType {
  FULL = "full",
  READ = "read",
  WRITE = "write",
}

export enum EmailType {
  TRANSACTIONAL = "transactional",
  MARKETING = "marketing",
  PRODUCT_UPDATE = "product_update",
  FEATURE_ANNOUNCEMENT = "feature_announcement",
}

export enum EmailPriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum OAuthProvider {
  GOOGLE = "google",
  GITHUB = "github",
}

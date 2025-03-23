export enum ENVType {
    PRODUCTION = 'production',
    STAGING = 'staging',
    DEVELOPMENT = 'development'
    }

export enum AppChannel {
    WEB = "web",
    MOBILE = "mobile",
    DESKTOP = "desktop",
    WATCH = "watch"
    }


    
export enum UserType {
    SUPERADMIN = "superadmin",
    ADMIN = "admin",
    CREATOR = "creator",
    LISTENER ="listener",
    USER = "user"
    }
    
export enum DbModels {
    USER = "User",
    ROLE = "Role",
    CATALOG = "Catalog",
    PLAYLIST = "Playlist",
    SERMON = "Sermon"
}

export enum ModelEnums {
    USER = "User",
    ROLE = "Role"

}

export enum sermonType{
    SERIES = 'series',
    ONEOFF = 'one-off'
}

export enum partType{
    ONE = 'one',
    TW0 = 'two',
    THREE = 'three',
    FOUR = 'four',
    FIVE = 'five',
    SIX = 'six',
    SEVEN = 'seven'
}

export enum playlistType {
    SERMON = 'sermon',
    SERMONBITE = 'sermonbite'
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
    ZAR = "ZAR"
}


export enum Providers {
    PAYSTACK = "Paystack",
    FLUTTERWAVE = "Flutterwave",
    STRIPE = "Stripe",
    PAYPAL = "PayPal",
    SQUARE = "Square",
    ALIPAY = "Alipay",
    WECHAT_PAY = "WeChat Pay"
}

export enum SubcriptionType {
    FREE = "free",
    TRIAL = "trial",
    PREMIUM = "premium",
    FAMILY = "family",
    STUDENT = "student"
}

export enum SubscriptionStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}

export enum TransactionsType {
    CREDIT = 'credit',
    DEBIT = 'debit',
    DEFAULT = 'default'
}

export enum TransactionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    FAILED = 'failed',
    SUCCESSFUL = 'successful',
    REFUNDED = 'refunded',
    DEFAULT = 'default'
}

export enum TransactionReason {
    PENDING = 'pending',
    ABANDONED = 'abandoned',
    FRAUDULENT = 'fraudulent',
    REFUNDED = 'refunded',
    COMPLETED = 'completed',
    FAILED = 'failed',
    ONGOING = 'ongoing',
    CANCELLED = "cancelled",
    DEFAULT = 'default'
}


export enum deviceType {
    ANDROID = "android",
    IOS = "ios"
}
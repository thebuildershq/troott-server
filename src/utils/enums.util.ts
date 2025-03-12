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


export enum PaymentPartners {
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

export enum deviceType {
    ANDROID = "android",
    IOS = "ios"
}
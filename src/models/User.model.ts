import mongoose, { Schema, Model } from "mongoose";
import { IUserDoc } from "../utils/interface.util";
import {
  EDbModels,
  EOtpType,
  EPasswordType,
  EUserType,
} from "../utils/enums.util";
import userService from "../services/user.service";

const UserSchema = new Schema<IUserDoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true, default: "", select: false },
    passwordType: {
      type: String,
      enum: Object.values(EPasswordType),
      default: EPasswordType.USERGENERATED,
    },
    userType: {
      type: String,
      enum: Object.values(EUserType),
    },
    phoneNumber: { type: String },
    phoneCode: { type: String, default: "+234" },
    country: { type: String },
    countryPhone: { type: String },

    avatar: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    location: {
      address: String,
      city: String,
      state: String,
    },

    Otp: { type: String },
    OtpExpiry: {
      type: Number,
    },
    otpType: { type: String, enum: Object.values(EOtpType) },
    accessToken: { type: String },
    accessTokenExpiry: { type: Date },

    isSuper: { type: Boolean, default: false },
    isStaff: { type: Boolean, default: false },
    isPreacher: { type: Boolean, default: false },
    isCreator: { type: Boolean, default: false },
    isListener: { type: Boolean, default: false },

    isActivated: { type: Boolean, default: false },
    isDeactivated: { type: Boolean, default: false },

    loginInfo: {
      ip: String,
      deviceType: String,
      platform: {
        type: String,
        enum: ["web", "mobile", "tablet"],
      },
      deviceInfo: {
        manufacturer: String,
        model: String,
        osName: String,
        osVersion: String,
        browser: String,
        browserVersion: String,
        appVersion: String,
      },
      location: {
        country: String,
        city: String,
        timezone: String,
      },
    },
    lastLogin: { type: String },
    isActive: { type: Boolean, default: false },
    
    loginLimit: { type: Number, default: 5 },
    lockedUntil: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },

    // Notification Preferences
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },

    // Relationships
    role: { type: Schema.Types.ObjectId, ref: EDbModels.ROLE, index: true },
  },
  {
    timestamps: true,
    versionKey: "_version",
    toJSON: {
      transform(doc: any, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);


UserSchema.set("toJSON", { virtuals: true, getters: true });

UserSchema.pre<IUserDoc>("save", async function (next) {
  if (!this.isModified("password")) return next();
  await userService.encryptUserPassword(this, this.password);
  next();
});

UserSchema.pre<IUserDoc>("insertMany", async function (next) {
  next();
});

const User: Model<IUserDoc> = mongoose.model<IUserDoc>(
  EDbModels.USER,
  UserSchema
);

export default User;

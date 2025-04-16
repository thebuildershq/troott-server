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
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, default: "",  select: false },
    passwordType: {
      type: String,
      enum: Object.values(EPasswordType),
      default: EPasswordType.USERGENERATED,
    },
    userType: {
      type: String,
      enum: Object.values(EUserType),
      required: true,
      index: true,
    },
    country: { type: String, required: true, index: true },
    phoneNumber: { type: String, unique: true, required: true, index: true },
    phoneCode: { type: String, default: "+234" },
    avatar: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },



    Otp: { type: String },
    OtpExpiry: {
      type: Number,
    },
    otpType: { type: String, enum: Object.values(EOtpType) },
    accessToken: { type: String },
    accessTokenExpiry: { type: Date },

    isSuper: { type: Boolean, default: false, index: true },
    isStaff: { type: Boolean, default: false, index: true },
    isPreacher: { type: Boolean, default: false, index: true },
    isCreator: { type: Boolean, default: false, index: true },
    isListener: { type: Boolean, default: false, index: true },

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

const User: Model<IUserDoc> = mongoose.model<IUserDoc>(
  EDbModels.USER,
  UserSchema
);

export default User;

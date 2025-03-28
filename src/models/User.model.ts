import mongoose, { Schema, Model } from "mongoose";
import { IUserDoc } from "../utils/interface.util";
import { EDbModels, EOtpType, EUserType } from "../utils/enums.util";
import bcrypt from "bcrypt";
import tokenService from "../services/token.service";


const UserSchema = new Schema<IUserDoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, default: "", select: true },

    userType: { type: String, enum: Object.values(EUserType), required: true, index: true },
    country: { type: String, required: true, index: true },
    phoneNumber: { type: String, unique: true, required: true, index: true },
    phoneCode: { type: String, default: "+234" },
    avatar: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
  

    passwordType: { type: String },
    savedPassword: { type: String },

    activationCode: { type: String },
    activationCodeExpiry: { type: Date },
    accessToken: { type: String },
    accessTokenExpiry: { type: Date },

    Otp: { type: String },
    OtpExpiry: { type: Date },
    otpType: { type: String, enum: Object.values(EOtpType) },

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
    roles: [{ type: Schema.Types.ObjectId, ref: EDbModels.ROLE, index: true }],
    profiles: {
      listener: { type: Schema.Types.ObjectId, ref: EUserType.LISTENER, index: true },
      creator: { type: Schema.Types.ObjectId, ref: EUserType.CREATOR, index: true},
      preacher: { type: Schema.Types.ObjectId, ref: EUserType.PREACHER, index: true  },
      staff: { type: Schema.Types.ObjectId, ref: EUserType.STAFF, index: true},
    },
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
  if (!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (password: string) {
  let result: boolean = false;
  if (this.password && this.password !== "") {
    result = await bcrypt.compare(password, this.password);
  }
  return result;
};


const User: Model<IUserDoc> = mongoose.model<IUserDoc>(
 EDbModels.USER,
  UserSchema
);

export default User;

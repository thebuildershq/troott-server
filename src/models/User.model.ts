import { Model, Schema } from "mongoose";
import { IUserDoc } from "../utils/interface.util";
import { DbModels, UserType } from "../utils/enums.util";
import mongoose from "mongoose";
import slugify from "slugify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Schema<IUserDoc>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
        password: { type: String, required: true, default: "", select: true },
        phoneNumber: { type: String, unique: true, required: true },
        phoneCode: { type: String, default: "+234"  },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, required: true },
        profileImage: { type: String },
        device: { type: String },

        passwordType: { type: String },
        savedPassword: { type: String },
        userType: { type: String },

        activationCode: { type: String },
        activationCodeExpire: { type: Date },
        activationToken: { type: String },
        activationTokenExpire: { type: Date },

        resetPasswordToken: { type: String },
        resetPasswordTokenExpire: { type: Date },
        emailCode: { type: String },
        emailCodeExpire: { type: Date },
        inviteToken: { type: String },
        inviteTokenExpire: { type: Date },

        isSuper: { type: String },
        isActivated: { type: Boolean, default: false },
        isAdmin: { type: String },
        isUser: { type: String, default: UserType.LISTENER },
        isActive: { type: Boolean, default: true },

        loginLimit: { type: Number, default: 0 },
        isLocked: { type: Boolean, default: false },
        lockedUntil: { type: Date },
        lastLogin: { type: Date },
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
  if (this.isModified("password")) {   
    const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.matchPassword = async function (password: string) {
  let result: boolean = false;
  if (this.password && this.password !== "") {
    result = await bcrypt.compare(password, this.password);
  }
  return result;
};

UserSchema.methods.getAuthToken = async function () {

  const secret = process.env.JWT_SECRET as string
  const expire = process.env.JWT_EXPIRY as string

  
  let token: string = "";

  if (!secret ) {
    throw new Error("JWT_SECRET is not defined.");
  }
  if (!expire) {
    throw new Error("JWT_EXPIRY is not defined.");
  }
   token = await jwt.sign(
    {
      id: this._id,
      email: this.email,
      isSuper: this.isSuper,
      isAdmin: this.isAdmin,
      isUser: this.isUser,
      role: this.role,
    },
    secret,
    {
      algorithm: "HS512",
      expiresIn: process.env.JWT_EXPIRY,
    }
  );

  return token;
};

UserSchema.statics.getUsers = async () => {
    return await User.find({});
  };
  
  UserSchema.methods.findById = async (id: any) => {
    const user = await User.findOne({ _id: id });
    return User ? User : null;
  };
  
const User: Model<IUserDoc> = mongoose.model<IUserDoc>(DbModels.USER, UserSchema);


export default User
import mongoose, { Schema, Model } from "mongoose";
import { IStaffProfileDoc } from "../utils/interface.util";
import { EDbModels, EVerificationStatus, EStaffUnit, EStaffRole } from "../utils/enums.util";
import { decrypt, encrypt } from "../utils/encryption.util";


const StaffProfileSchema = new Schema<IStaffProfileDoc>(
  {
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },

    gender: { type: String, required: true, index: true},
    avatar: { type: String },
    dateOfBirth: { type: Date, required: true },
    country: { type: String, required: true, index: true },
    phoneNumber: { type: String, unique: true, required: true },
    phoneCode: { type: String, default: "+234" },
    location: { type: Object, required: true },
    slug: { type: String, required: true, unique: true },

    // Staff Role & Access
    unit: {
      type: String,
      enum: Object.values(EStaffUnit),
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: Object.values(EStaffRole),
      required: true,
      index: true
    },
    accessLevel: { type: Number, required: true },
    permissions: [{ type: String }],

    // API & Security
    apiKeys: [
      {
        key: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        lastUsed: { type: Date },
      },
    ],
    ipWhitelist: [{ type: String }],
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: { type: Date },
    devices: [
      {
        deviceId: { type: String },
        deviceType: { type: String },
        lastUsed: { type: Date },
      },
    ],

    // Actions & Moderation
    actionsTaken: [
      {
        action: { type: String, required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    moderatedContent: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],

    // Uploads & Publications
    uploads: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    uploadHistory: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    publishedCount: { type: Number, default: 0 },

    // Security & Verification
    identification: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: Object.values(EVerificationStatus),
      default: EVerificationStatus.PENDING,
    },
    isVerified: { type: Boolean, default: false, index: true },
    verifiedAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    isSuspended: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    // Relationships
    user: { type: Schema.Types.ObjectId, ref: EDbModels.USER, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER, index: true },
    settings: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
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

StaffProfileSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  unit: "text",
  role: "text",
});


StaffProfileSchema.set("toJSON", { virtuals: true, getters: true });

StaffProfileSchema.pre("save", function (next) {
  if (this.isModified("apiKeys")) {
    this.apiKeys = this.apiKeys.map((apiKey) => ({
      ...apiKey,
      key: encrypt(apiKey.key),
    }));
  }
  next();
});

StaffProfileSchema.methods.decryptApiKeys = function () {
  if (this.apiKeys) {
    return this.apiKeys.map((apiKey: any) => ({
      ...apiKey,
      key: decrypt(apiKey.key),
    }));
  }
  return this.apiKeys;
};


const StaffProfile: Model<IStaffProfileDoc> = mongoose.model<IStaffProfileDoc>(
  EDbModels.STAFF,
  StaffProfileSchema
);

export default StaffProfile;

import mongoose, { Schema, Model } from "mongoose";
import { IPreacherProfileDoc } from "../utils/interface.util";
import {
  EDbModels,
  EVerificationStatus,
  EAccountManagerRole,
} from "../utils/enums.util";

const PreacherProfileSchema = new Schema<IPreacherProfileDoc>(
  {
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },

    gender: { type: String, required: true, index: true },
    avatar: { type: String },
    dateOfBirth: { type: Date, required: true },
    country: { type: String, required: true, index: true },
    phoneNumber: { type: String, unique: true, required: true },
    phoneCode: { type: String, default: "+234" },
    location: { type: Object, required: true, index: "2dsphere" },
    slug: { type: String, required: true, unique: true },

    // Ministry & Content
    description: { type: String, maxLength: 500 },
    ministry: { type: String, index: true },
    sermons: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    featuredSermons: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    bites: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE }],
    topSermons: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    topBites: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE }],

    // Playlist System
    playlists: [{ type: Schema.Types.ObjectId, ref: EDbModels.PLAYLIST }],
    featuredPlaylists: [
      { type: Schema.Types.ObjectId, ref: EDbModels.PLAYLIST },
    ],

    // Followers & Listeners
    followers: [
      { type: Schema.Types.ObjectId, ref: EDbModels.USER, index: true },
    ],
    monthlyListeners: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

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
      index: true,
    },
    isVerified: { type: Boolean, default: false, index: true },
    verifiedAt: { type: Date, default: null },
    permissions: [{ type: String, index: true }],
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: { type: Date },
    devices: [
      {
        deviceId: { type: String },
        deviceType: { type: String },
        lastUsed: { type: Date },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
    isSuspended: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    // Account Managers
    accountManagers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
        role: {
          type: String,
          enum: Object.values(EAccountManagerRole),
          required: true,
        },
      },
    ],

    // Relationships
    user: { type: Schema.Types.ObjectId, ref: EDbModels.USER, index: true },
    transactions: [
      { type: Schema.Types.ObjectId, ref: EDbModels.TRANSACTION, index: true },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.USER,
      index: true,
    },
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

PreacherProfileSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  description: "text",
  ministry: "text",
});

// Compound Indexes*
PreacherProfileSchema.index({ isVerified: 1, verificationStatus: 1 });
PreacherProfileSchema.index({ isActive: 1, isSuspended: 1 });

PreacherProfileSchema.set("toJSON", { virtuals: true, getters: true });

const PreacherProfile: Model<IPreacherProfileDoc> =
mongoose.model<IPreacherProfileDoc>(
    EDbModels.PREACHER,
    PreacherProfileSchema
  );

export default PreacherProfile;

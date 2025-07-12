import mongoose, { Schema, Model } from "mongoose";
import { IPreacherDoc } from "../utils/interface.util";
import {
  DbModels,
  VerificationStatus,
  AccountManagerRole,
} from "../utils/enums.util";

const PreacherSchema = new Schema<IPreacherDoc>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },

    phoneNumber: { type: String, unique: true, },
    phoneCode: { type: String, default: "+234" },
    country: { type: String },
    countryPhone: { type: String },
    avatar: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String},
    slug: { type: String },

    // Ministry & Content
    description: { type: String },
    ministry: { type: String },
    sermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    featuredSermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    bites: [{ type: Schema.Types.ObjectId, ref: DbModels.BITE }],
    topSermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    topBites: [{ type: Schema.Types.ObjectId, ref: DbModels.BITE }],

    // Playlist System
    playlists: [{ type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST }],
    featuredPlaylists: [
      { type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST },
    ],

    // Followers & Listeners
    followers: [
      { type: Schema.Types.ObjectId, ref: DbModels.USER },
    ],
    monthlyListeners: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // Uploads & Publications
    uploads: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    uploadHistory: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    

    // Security & Verification
    identification: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },   

    // Account Managers
    accountManagers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: DbModels.USER },
        role: {
          type: String,
          enum: Object.values(AccountManagerRole),
          required: true,
        },
      },
    ],

    // Relationships
    user: { type: Schema.Types.ObjectId, ref: DbModels.USER },
    transactions: [
      { type: Schema.Types.ObjectId, ref: DbModels.TRANSACTION },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: DbModels.USER,
      index: true,
    },
    deletedSermons: [
      {
        id: { type: Schema.Types.ObjectId, ref: DbModels.SERMON },
        deletedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
        deletedAt: { type: Date, default: Date.now },
        reason: { type: String },
      },
    ],
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

PreacherSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  description: "text",
  ministry: "text",
});

// Compound Indexes*
PreacherSchema.index({ isVerified: 1, verificationStatus: 1 });
PreacherSchema.index({ isActive: 1, isSuspended: 1 });

PreacherSchema.set("toJSON", { virtuals: true, getters: true });

const Preacher: Model<IPreacherDoc> =
mongoose.model<IPreacherDoc>(
    DbModels.PREACHER,
    PreacherSchema
  );

export default Preacher;

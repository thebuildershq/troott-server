import mongoose, { Schema, Model } from "mongoose";
import { IPreacherDoc } from "../utils/interface.util";
import {
  EDbModels,
  EVerificationStatus,
  EAccountManagerRole,
} from "../utils/enums.util";

const PreacherSchema = new Schema<IPreacherDoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    phoneNumber: { type: String, unique: true, required: true },
    phoneCode: { type: String, default: "+234" },
    country: { type: String, required: true },
    countryPhone: { type: String, required: true },
    avatar: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },

    slug: { type: String, required: true, unique: true },

    // Ministry & Content
    description: { type: String },
    ministry: { type: String },
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
      { type: Schema.Types.ObjectId, ref: EDbModels.USER },
    ],
    monthlyListeners: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // Uploads & Publications
    uploads: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    uploadHistory: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    

    // Security & Verification
    identification: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: Object.values(EVerificationStatus),
      default: EVerificationStatus.PENDING,
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },   

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
    user: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
    transactions: [
      { type: Schema.Types.ObjectId, ref: EDbModels.TRANSACTION },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.USER,
      index: true,
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
    EDbModels.PREACHER,
    PreacherSchema
  );

export default Preacher;

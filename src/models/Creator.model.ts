import mongoose, { Schema, Model } from "mongoose";
import { ICreatorProfileDoc } from "../utils/interface.util";
import {
  EDbModels,
  EVerificationStatus,
  EAccountManagerRole,
} from "../utils/enums.util";

const CreatorProfileSchema = new Schema<ICreatorProfileDoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    gender: { type: String, required: true },
    avatar: { type: String },
    dateOfBirth: { type: Date, required: true },
    country: { type: String, required: true },
    phoneNumber: { type: String, unique: true, required: true },
    phoneCode: { type: String, default: "+234" },
    location: { type: Object, required: true },
    slug: { type: String, required: true, unique: true },

    // Content
    description: { type: String, maxLength: 500 },
    bites: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE }],
    topBites: [
      { type: Schema.Types.ObjectId, ref: EDbModels.BITE},
    ],

    // Followers & Listeners
    followers: [{ type: Schema.Types.ObjectId, ref: EDbModels.USER }],
    monthlyListeners: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // Uploads & Publications
    uploads: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE }],
    uploadHistory: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE }],
    publishedCount: { type: Number, default: 0 },

    // Security & Verification
    identification: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: Object.values(EVerificationStatus),
      default: EVerificationStatus.PENDING,
  
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    permissions: [{ type: String }],
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: { type: Date },
    devices: [
      {
        deviceId: { type: String },
        deviceType: { type: String },
        lastUsed: { type: Date },
    
      },
    ],
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

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
    user: { type: Schema.Types.ObjectId, ref: EDbModels.USER  },
    transactions: [{ type: Schema.Types.ObjectId, ref: EDbModels.TRANSACTION  }],
    createdBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER  },
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

CreatorProfileSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  description: "text",
});


CreatorProfileSchema.set("toJSON", { virtuals: true, getters: true });

const CreatorProfile: Model<ICreatorProfileDoc> =
  mongoose.model<ICreatorProfileDoc>(EDbModels.CREATOR, CreatorProfileSchema);

export default CreatorProfile;

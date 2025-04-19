import mongoose, { Schema, Model } from "mongoose";
import { ICreatorDoc } from "../utils/interface.util";
import {
  EDbModels,
  EVerificationStatus,
  EAccountManagerRole,
} from "../utils/enums.util";

const CreatorSchema = new Schema<ICreatorDoc>(
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
  

    // Security & Verification
    identification: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: Object.values(EVerificationStatus),
      default: EVerificationStatus.PENDING,
  
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
    user: { type: Schema.Types.ObjectId, ref: EDbModels.USER  },
    transactions: [{ type: Schema.Types.ObjectId, ref: EDbModels.TRANSACTION  }],
    createdBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER  },
    
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


CreatorSchema.set("toJSON", { virtuals: true, getters: true });

const Creator: Model<ICreatorDoc> =
  mongoose.model<ICreatorDoc>(EDbModels.CREATOR, CreatorSchema);

export default Creator;

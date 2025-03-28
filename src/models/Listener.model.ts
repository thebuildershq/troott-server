import mongoose, { Schema, Model } from "mongoose";
import { IListenerProfileDoc } from "../utils/interface.util";
import { EDbModels } from "../utils/enums.util";

const ListenerProfileSchema = new Schema<IListenerProfileDoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true  },

    gender: { type: String, required: true, index: true },
    avatar: { type: String },
    dateOfBirth: { type: Date, required: true },
    country: { type: String, required: true, index: true },
    phoneNumber: { type: String, required: true },
    phoneCode: { type: String, default: "+234" },
    location: { type: Schema.Types.Mixed, required: true, index: "2dsphere" },
    slug: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    card: { type: Schema.Types.Mixed }, 

    // Engagement Tracking
    playlists: [{ type: Schema.Types.ObjectId, ref: EDbModels.PLAYLIST, index: true }],
    listeningHistory: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON, index: true }],
    likedSermons: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON, index: true }],
    sharedSermons: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON, index: true }],
    
    viewedSermonBites: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE, index: true }],
    sharedSermonBites: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE, index: true }],
    savedSermonBites: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE, index: true }],

    followers: [{ type: Schema.Types.ObjectId, ref: EDbModels.USER, index: true }],
    following: [{ type: Schema.Types.ObjectId, ref: EDbModels.USER, index: true }],
    interests: [{ type: String }],
    badges: [{ type: String }],

    // Security & Access Control
    permissions: [{ type: String }],
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: { type: Date },
    loginHistory: [
      {
        date: { type: Date, default: Date.now },
        ip: { type: String },
        device: { type: String },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
    isSuspended: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },

    // Relationships
    user: { type: Schema.Types.ObjectId, ref: EDbModels.USER, required: true, index: true },
    subscriptions: [{ type: Schema.Types.ObjectId, ref: EDbModels.PLAN, index: true }],
    transactions: [{ type: Schema.Types.ObjectId, ref: EDbModels.TRANSACTION, index: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER, index: true },
    //settings: { type: Schema.Types.ObjectId, ref: "Settings" }, // Adjust model name if needed
  },
  {
    timestamps: true,
    versionKey: "_version",
    toJSON: {
      transform(doc: any, ret) {
        ret.id = ret._id;
      },
    },
  }
);

ListenerProfileSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  description: "text",
});

const ListenerProfile: Model<IListenerProfileDoc> = mongoose.model<IListenerProfileDoc>(
  EDbModels.LISTENER,
  ListenerProfileSchema
);

export default ListenerProfile;

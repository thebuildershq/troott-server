import mongoose, { Schema, Model } from "mongoose";
import { IListenerDoc } from "../utils/interface.util";
import { EDbModels } from "../utils/enums.util";

const ListenerProfileSchema = new Schema<IListenerDoc>(
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

    
    slug: { type: String, required: true },
    type: { type: String, required: true },
    card: {
  
      authCode: String, 
      cardBin: String,
      cardLast: String,
      expiryMonth: String,
      expiryYear: String,
      cardPan: String,
      token: String,
  
      select: false,
    }, 

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


    // Relationships
    user: { type: Schema.Types.ObjectId, ref: EDbModels.USER, required: true, index: true },
    subscriptions: [{ type: Schema.Types.ObjectId, ref: EDbModels.SUBSCRIPTION, index: true }],
    transactions: [{ type: Schema.Types.ObjectId, ref: EDbModels.TRANSACTION, index: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER, index: true },

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

const Listener: Model<IListenerDoc> = mongoose.model<IListenerDoc>(
  EDbModels.LISTENER,
  ListenerProfileSchema
);

export default Listener;

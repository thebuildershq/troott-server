import mongoose, { Schema, Model } from "mongoose";
import { IListenerDoc } from "../utils/interface.util";
import { DbModels } from "../utils/enums.util";

const ListenerSchema = new Schema<IListenerDoc>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },

    phoneNumber: { type: String,},
    phoneCode: { type: String, default: "+234" },
    country: { type: String },
    countryPhone: { type: String },
    avatar: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String},
    slug: { type: String },

    card: {
      type: {
        authCode: String, 
        cardBin: String,
        cardLast: String,
        expiryMonth: String,
        expiryYear: String,
        cardPan: String,
        token: String,
      },
      select: false
    }, 

    // Engagement Tracking
    playlists: [{ type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST }],
    listeningHistory: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    likedSermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    sharedSermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],
    
    viewedSermonBites: [{ type: Schema.Types.ObjectId, ref: DbModels.BITE }],
    sharedSermonBites: [{ type: Schema.Types.ObjectId, ref: DbModels.BITE }],
    savedSermonBites: [{ type: Schema.Types.ObjectId, ref: DbModels.BITE }],

    followers: [{ type: Schema.Types.ObjectId, ref: DbModels.USER }],
    following: [{ type: Schema.Types.ObjectId, ref: DbModels.USER }],
    interests: [{ type: String }],
    badges: [{ type: String }],


    // Relationships
    user: { type: Schema.Types.ObjectId, ref: DbModels.USER, required: true },
    subscriptions: [{ type: Schema.Types.ObjectId, ref: DbModels.SUBSCRIPTION }],
    transactions: [{ type: Schema.Types.ObjectId, ref: DbModels.TRANSACTION }],
    createdBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },

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

ListenerSchema.index({ user: 1, type: 1 }, { unique: true });

const Listener: Model<IListenerDoc> = mongoose.model<IListenerDoc>(
  DbModels.LISTENER,
  ListenerSchema
);

export default Listener;

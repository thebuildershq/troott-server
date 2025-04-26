import mongoose, { Schema, Model } from "mongoose";
import { IListenerDoc } from "../utils/interface.util";
import { EDbModels } from "../utils/enums.util";

const ListenerSchema = new Schema<IListenerDoc>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    phoneNumber: { type: String, unique: true, },
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
    playlists: [{ type: Schema.Types.ObjectId, ref: EDbModels.PLAYLIST }],
    listeningHistory: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    likedSermons: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    sharedSermons: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],
    
    viewedSermonBites: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE }],
    sharedSermonBites: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE }],
    savedSermonBites: [{ type: Schema.Types.ObjectId, ref: EDbModels.BITE }],

    followers: [{ type: Schema.Types.ObjectId, ref: EDbModels.USER }],
    following: [{ type: Schema.Types.ObjectId, ref: EDbModels.USER }],
    interests: [{ type: String }],
    badges: [{ type: String }],


    // Relationships
    user: { type: Schema.Types.ObjectId, ref: EDbModels.USER, required: true },
    subscriptions: [{ type: Schema.Types.ObjectId, ref: EDbModels.SUBSCRIPTION }],
    transactions: [{ type: Schema.Types.ObjectId, ref: EDbModels.TRANSACTION }],
    createdBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },

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

ListenerSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  description: "text",
});

const Listener: Model<IListenerDoc> = mongoose.model<IListenerDoc>(
  EDbModels.LISTENER,
  ListenerSchema
);

export default Listener;

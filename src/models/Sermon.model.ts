import mongoose, { Schema, Model } from "mongoose";
import { ISermonDoc } from "../utils/interface.util";
import { DbModels, ContentState, ContentStatus } from "../utils/enums.util";

const SermonSchema = new Schema<ISermonDoc>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true, maxLength: 1000 },
    duration: { type: Number, required: true }, // In sConds
    releaseDate: { type: Date, required: true },
    releaseYear: { type: Number, required: true },
    sermonUrl: { type: String, required: true },
    imageUrl: { type: String },
    size: { type: Number },

    topic: { type: String },
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: true, index: true },
    shareableUrl: { type: String },
    
    isSeries: { type: Boolean, default: false },
    series: [{
      type: Schema.Types.ObjectId,
      ref: DbModels.SERIES,
      default: null,
      index: true,
    }],

    totalPlay: [{
      userId: { type: Schema.Types.ObjectId, ref: DbModels.USER },
      playedAt: { type: Date },
    }],
    totalLikes: [{
      userId: { type: Schema.Types.ObjectId, ref: DbModels.USER },
      likedAt: { type: Date },
    }],
    totalShares: [{
      UserId: { type: Schema.Types.ObjectId, ref: DbModels.USER },
      shareAt: { type: Date },
    }],
    state: {
      type: String,
      enum: Object.values(ContentState),
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ContentStatus),
      index: true,
    },

    // Modifications
    versionId: {
      type: Schema.Types.ObjectId,
      ref: DbModels.SERMON,
      default: null,
    },

    changesSummary: { type: String },
    

    // Relationships
    preacher: {
      type: Schema.Types.ObjectId,
      ref: DbModels.PREACHER,
      required: true,
      index: true,
    },

    playlist: { type: Schema.Types.ObjectId, ref: DbModels.PLAYLIST },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: DbModels.USER,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: "_version",
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

SermonSchema.index({ title: "text", description: "text" });

const Sermon: Model<ISermonDoc> = mongoose.model<ISermonDoc>(
  DbModels.SERMON,
  SermonSchema
);

export default Sermon;

import mongoose, { Schema, Model } from "mongoose";
import { ISermonDoc } from "../utils/interface.util";
import { EDbModels, EContentState, EContentStatus } from "../utils/enums.util";

const SermonSchema = new Schema<ISermonDoc>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true, maxLength: 1000 },
    duration: { type: Number, required: true }, // In seconds
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
      ref: EDbModels.SERIES,
      default: null,
      index: true,
    }],

    totalPlay: [{
      userId: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
      playedAt: { type: Date },
    }],
    totalLikes: [{
      userId: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
      likedAt: { type: Date },
    }],
    totalShares: [{
      UserId: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
      shareAt: { type: Date },
    }],
    state: {
      type: String,
      enum: Object.values(EContentState),
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(EContentStatus),
      index: true,
    },

    // Modifications
    versionId: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.SERMON,
      default: null,
    },

    changesSummary: { type: String },
    

    // Relationships
    preacher: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.PREACHER,
      required: true,
      index: true,
    },

    playlist: { type: Schema.Types.ObjectId, ref: EDbModels.PLAYLIST },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.USER,
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
  EDbModels.SERMON,
  SermonSchema
);

export default Sermon;

import mongoose, { Schema, Model } from "mongoose";
import { ISermonDoc } from "../utils/interface.util";
import {
  EDbModels,
  EContentState,
  EContentStatus,
} from "../utils/enums.util";

const SermonSchema = new Schema<ISermonDoc>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true, maxLength: 1000 },
    duration: { type: Number, required: true }, // In seconds
    category: [{ type: String }],
    sermonUrl: { type: String, required: true },
    imageUrl: { type: String },
    tags: [{ type: String }],

    isPublic: { type: Boolean, default: true, index: true },
    totalPlay: { type: Object, required: true },
    totalShares: { type: Object, required: true },
    isSeries: { type: Boolean, default: false },
    state: { type: String, enum: Object.values(EContentState), required: true, index: true },
    status: {
      type: String,
      enum: Object.values(EContentStatus),
      required: true,
      index: true
    },

    // Modifications
    versionId: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.SERMON,
      default: null,
    },
    modifiedAt: { type: Date, default: Date.now },
    modifiedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER, index: true },
    changesSummary: { type: String, default: "" },
    deletedSermons: [
      {
        id: { type: Schema.Types.ObjectId, ref: EDbModels.SERMON },
        deletedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
        deletedAt: { type: Date, default: Date.now },
        reason: { type: String },
      },
    ],

    // Relationships
    preacher: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.PREACHER,
      required: true,
      index: true
    },
    series: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.SERIES,
      default: null,
      index: true
    },
    staff: { type: Schema.Types.ObjectId, ref: EDbModels.STAFF },
    playlist: { type: Schema.Types.ObjectId, ref: EDbModels.PLAYLIST },
    library: { type: Schema.Types.ObjectId, ref: EDbModels.LIBRARY },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.USER,
      required: true,
      index: true
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

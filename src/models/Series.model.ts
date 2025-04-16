import mongoose, { Schema, Model } from "mongoose";
import { ISeriesDoc } from "../utils/interface.util";
import { EDbModels, EContentState, EContentStatus } from "../utils/enums.util";

const SeriesSchema = new Schema<ISeriesDoc>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, default: "", maxLength: 1000 },
    imageUrl: { type: String, default: "" },
    tags: [{ type: String, index: true }],

    preacher: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.PREACHER,
      required: true,
      index: true,
    },
    sermons: [{ type: Schema.Types.ObjectId, ref: EDbModels.SERMON }],

    // State & Visibility
    isPublic: { type: Boolean, default: true, index: true },
    state: {
      type: String,
      enum: Object.values(EContentState),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(EContentStatus),
      required: true,
      index: true,
    },

    // Engagement & Analytics
    totalPlay: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },

    // Modifications
    versionId: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.SERIES,
      default: null,
    },
    modifiedAt: { type: Date, default: Date.now },
    modifiedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
    changesSummary: { type: String, default: "" },
    deletedSeries: [
      {
        id: { type: Schema.Types.ObjectId, ref: EDbModels.SERIES },
        deletedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
        deletedAt: { type: Date, default: Date.now },
        reason: { type: String },
      },
    ],

    // Relationships
    staff: { type: Schema.Types.ObjectId, ref: EDbModels.STAFF },
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

SeriesSchema.index({ title: "text", description: "text" });

const Series: Model<ISeriesDoc> = mongoose.model<ISeriesDoc>(
  EDbModels.SERIES,
  SeriesSchema
);

export default Series;

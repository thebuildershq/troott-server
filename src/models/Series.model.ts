import mongoose, { Schema, Model } from "mongoose";
import { ISeriesDoc } from "../utils/interface.util";
import { DbModels, ContentState, ContentStatus } from "../utils/enums.util";

const SeriesSchema = new Schema<ISeriesDoc>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, default: "", maxLength: 1000 },
    imageUrl: { type: String, default: "" },
    tags: [{ type: String, index: true }],

    preacher: {
      type: Schema.Types.ObjectId,
      ref: DbModels.PREACHER,
      required: true,
      index: true,
    },
    sermons: [{ type: Schema.Types.ObjectId, ref: DbModels.SERMON }],

    // State & Visibility
    isPublic: { type: Boolean, default: true, index: true },
    state: {
      type: String,
      enum: Object.values(ContentState),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ContentStatus),
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
      ref: DbModels.SERIES,
      default: null,
    },
    modifiedAt: { type: Date, default: Date.now },
    modifiedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
    changesSummary: { type: String, default: "" },
    deletedSeries: [
      {
        id: { type: Schema.Types.ObjectId, ref: DbModels.SERIES },
        deletedBy: { type: Schema.Types.ObjectId, ref: DbModels.USER },
        deletedAt: { type: Date, default: Date.now },
        reason: { type: String },
      },
    ],

    // Relationships
    staff: { type: Schema.Types.ObjectId, ref: DbModels.STAFF },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: DbModels.USER,
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
  DbModels.SERIES,
  SeriesSchema
);

export default Series;

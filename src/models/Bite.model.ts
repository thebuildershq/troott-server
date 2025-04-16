import mongoose, { Schema, Model } from "mongoose";
import { ISermonBiteDoc } from "../utils/interface.util";
import {
  EDbModels,
  EContentState,
  EContentStatus,
} from "../utils/enums.util";

const SermonBiteSchema = new Schema<ISermonBiteDoc>(
  {
    title: { type: String, required: true },
    description: { type: String, maxLength: 500 },
    duration: { type: Number, required: true }, // In seconds
    category: [{ type: String }],
    biteURL: { type: String, required: true },
    thumbnailUrl: { type: String },
    tags: [{ type: String }],

    // Engagement & Analytics
    engagementStats: { type: Object, required: true },
    viewHistory: [{ type: Object }],
    likeHistory: [{ type: Object }],
    shareHistory: [{ type: Object }],
    savedHistory: [{ type: Object }],

    // State Management
    isPublic: { type: Boolean, default: true },
    state: { type: String, enum: Object.values(EContentState), required: true },
    status: { type: String, enum: Object.values(EContentStatus), required: true },

    // Modifications
    versionId: { type: Schema.Types.ObjectId, ref: EDbModels.BITE, default: null },
    modifiedAt: { type: String },
    modifiedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
    changesSummary: { type: String, default: "" },
    deletedBites: [
      {
        id: { type: Schema.Types.ObjectId, ref: EDbModels.BITE },
        deletedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
        deletedAt: { type: Date, default: Date.now },
        reason: { type: String },
    
      },
    ],

    // Relationships
    preacher: { type: Schema.Types.ObjectId, ref: EDbModels.PREACHER },
    creator: { type: Schema.Types.ObjectId, ref: EDbModels.CREATOR },
    staff: { type: Schema.Types.ObjectId, ref: EDbModels.STAFF },
    playlist: [{ type: Schema.Types.ObjectId, ref: EDbModels.PLAYLIST }],
    library: [{ type: Schema.Types.ObjectId, ref: EDbModels.LIBRARY }],
    createdBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
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

SermonBiteSchema.index({ title: "text", description: "text" });

const SermonBite: Model<ISermonBiteDoc> = mongoose.model<ISermonBiteDoc>(
  EDbModels.BITE,
  SermonBiteSchema
);

export default SermonBite;

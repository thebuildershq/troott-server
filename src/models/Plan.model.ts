import mongoose, { Schema, Model } from "mongoose";
import { IPlanDoc } from "../utils/interface.util";
import { DbModels } from "../utils/enums.util";

const PlanSchema = new Schema<IPlanDoc>(
  {
    name: { type: String, required: true, index: true },
    isEnabled: { type: Boolean, default: true, index: true },
    description: { type: String },
    label: { type: String, index: true },
    currency: { type: String, required: true, index: true },
    code: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },

    pricing: { type: Schema.Types.Mixed, required: true },
    trial: { type: Schema.Types.Mixed, required: true },
    sermon: { type: Schema.Types.Mixed, required: true },
    sermonBite: { type: Schema.Types.Mixed, required: true },

    // Relationships
    user: { 
        type: Schema.Types.ObjectId, 
        ref: DbModels.USER, 
        required: true, 
        index: true
    },
  },
  {
    timestamps: true,
    versionKey: "_versions",
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

PlanSchema.index({ name: "text", description: "text" });
PlanSchema.index({ isEnabled: 1, currency: 1 });

const Plan: Model<IPlanDoc> = mongoose.model<IPlanDoc>(
  DbModels.PLAN,
  PlanSchema
);

export default Plan;

import mongoose, { Schema, Model } from "mongoose";
import { ISubscriptionDoc } from "../utils/interface.util";
import { EDbModels } from "../utils/enums.util";

const SubscriptionSchema = new Schema<ISubscriptionDoc>(
  {
    code: { type: String, required: true, unique: true, index: true },
    isPaid: { type: Boolean, default: false, index: true },
    status: { type: String, required: true, index: true },
    slug: { type: String, unique: true, required: true },
    billing: { type: Schema.Types.Mixed, required: true },

    // Relationships
    user: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.USER,
      required: true,
      index: true,
    },
    transactions: [{
       type: Schema.Types.ObjectId, 
       ref: EDbModels.TRANSACTION
       }],
    plan: {
      type: Schema.Types.ObjectId,
      ref: EDbModels.PLAN,
      required: true,
      index: true,
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

SubscriptionSchema.index({ code: "text", slug: "text" });

const Subscription: Model<ISubscriptionDoc> = mongoose.model<ISubscriptionDoc>(
  EDbModels.SUBSCRIPTION,
  SubscriptionSchema
);

export default Subscription;

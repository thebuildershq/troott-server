import mongoose, { Model, Schema } from "mongoose";
import { IAPIKeyDoc } from "../utils/interface.util";
import {
  EAPIKeyEnvironment,
  EAPIKeyStatus,
  EAPIKeyType,
  EDbModels,
} from "../utils/enums.util";


const APIKeySchema = new Schema<IAPIKeyDoc>(
  {
    keyHash: { type: String, required: true, unique: true },
    environment: {
      type: String,
      enum: Object.values(EAPIKeyEnvironment),
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(EAPIKeyType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EAPIKeyStatus),
      required: true,
    },
    permissions: [{ type: String }],
    expiresAt: { type: String  },
    revokedAt: { type: String },
    revokedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
    description: { type: String },
    staff: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: EDbModels.STAFF,
    },
  },
  {
    timestamps: true,
    versionKey: "_version",
    toJSON: {
      transform(doc: any, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

APIKeySchema.index({ keyHash: 1 });
APIKeySchema.index({ userId: 1 });
APIKeySchema.index({ status: 1 });


const APIkey: Model<IAPIKeyDoc> = mongoose.model<IAPIKeyDoc>(
  EDbModels.API_KEY,
  APIKeySchema
);

export default APIkey
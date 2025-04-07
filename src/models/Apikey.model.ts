import mongoose, { Model, Schema } from "mongoose";
import { IAPIKeyMetadata } from "../utils/interface.util";
import {
  EAPIKeyEnvironment,
  EAPIKeyStatus,
  EAPIKeyType,
  EDbModels,
} from "../utils/enums.util";
import systemService from "../services/system.service";

const APIKeySchema = new Schema<IAPIKeyMetadata>(
  {
    keyHash: { type: String, required: true, unique: true },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: EDbModels.USER,
    },
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
    createdAt: { type: Date, required: true },
    lastUsed: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(EAPIKeyStatus),
      required: true,
    },
    permissions: [{ type: String }],
    revokedAt: { type: Date },
    revokedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
    description: { type: String },
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


const APIkey: Model<IAPIKeyMetadata> = mongoose.model<IAPIKeyMetadata>(
  EDbModels.API_KEY,
  APIKeySchema
);

export default APIkey
import mongoose, { Model, Schema, model } from "mongoose";
import { ISermonUpload } from "../utils/interface.util";
import { EDbModels, EUploadStatus } from "../utils/enums.util";


const SermonUploadSchema = new Schema<ISermonUpload>(
  {
    uploadId: { type: String, required: true, unique: true },
    filename: { type: String },
    fileSize: { type: Number },
    mimetype: { type: String },
    
    chunkSize: { type: Number },
    totalChunks: { type: Number },
    uploadedChunks: [{
        chunkNumber: { type: Number },
        etag: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date },
    }],
    
    status: {
      type: String,
      enum: Object.values(EUploadStatus),
      default: EUploadStatus.PENDING,
    },

    uploadedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
    sermonId: { type: Schema.Types.ObjectId, ref: EDbModels.SERMON },

    multipartUploadId: { type: String },
    s3Key: { type: String },
    streamS3Prefix: { type: String },
    metadata: {
      title: { type: String },
      description: { type: String },
      tags: [String],
      category: { type: String },
    },

    retryCount: { type: Number, default: 0 },
    lastChunkUploadedAt: { type: Date },
    expiresAt: { type: Date },
    error: { type: String },
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

SermonUploadSchema.set("toJSON", { virtuals: true, getters: true });

const UploadSermon: Model<ISermonUpload> = mongoose.model<ISermonUpload>(
  EDbModels.UPLOAD,
  SermonUploadSchema
);

export default UploadSermon;

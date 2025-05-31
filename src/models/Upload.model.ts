import mongoose, { Model, Schema, model } from "mongoose";
import { IUploadDoc } from "../utils/interface.util";
import { EDbModels, EUploadStatus, FileType } from "../utils/enums.util";


const UploadSchema = new Schema<IUploadDoc>(
  {
    uploadId: { type: String, required: true, unique: true },
    fileName: { type: String },
    fileSize: { type: Number },
    mimetype: { type: String },
    fileType: { type: String, enum: Object.values(FileType) },
    
    s3Key: { type: String },
    s3Url: { type: String },    
    metadata: {
      metadataType: { type: String, enum: Object.values(FileType), required: true },
      // Audio
      formatName: { type: String },
      codec: { type: String },
      duration: { type: Number },
      bitrate: { type: Number },
      year: { type: Number },
    
      // Image
      width: { type: Number },
      height: { type: Number },
      format: { type: String },
    
      // Document
      pageCount: { type: Number },
      author: { type: String },
      title: { type: String },
      language: { type: String },
    
      // Video
      resolution: { type: String },
      framerate: { type: Number },
    },
    status: {
      type: String,
      enum: Object.values(EUploadStatus),
      default: EUploadStatus.PENDING,
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: EDbModels.USER },
    
    chunkSize: { type: Number },
    totalChunks: { type: Number },
    completedChunks: { type: Number },
    multipartUploadId: { type: String },
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


const Upload: Model<IUploadDoc> = mongoose.model<IUploadDoc>(
  EDbModels.UPLOAD,
  UploadSchema
);

export default Upload;

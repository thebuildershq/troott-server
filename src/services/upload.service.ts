import {
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IAudioMetadata, IResult, IUserDoc } from "../utils/interface.util";
import UploadSession from "../models/Upload.model";
import StorageService from "./storage.service";
import { parseBuffer, parseStream } from "music-metadata";
import { v4 as uuidv4 } from "uuid";
import { ContentType, EUploadStatus } from "../utils/enums.util";
import { UploadSermonDTO } from "../dtos/sermon.dto";
import { PassThrough } from "stream";
import { Upload } from "@aws-sdk/lib-storage";

class UploadSermonService {
  private s3Client: S3Client;
  private storageService: typeof StorageService;
  private readonly CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly UPLOAD_EXPIRY = 6 * 60 * 60 * 1000; // 6 hours
  private readonly ALLOWED_AUDIO_TYPES = [
    "audio/mpeg",
    "audio/aac",
    "audio/wav",
    "audio/x-m4a",
  ];
  private readonly MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
    this.storageService = StorageService;
  }

  /**
   * Initiates a multipart upload session for large audio/video files.
   *
   * - Validates file type and size
   * - Calculates the number of chunks
   * - Creates a multipart upload in AWS S3
   * - Saves a new UploadSession document in DB - MongoDB
   *
   * @param {Express.Multer.File} file - The uploaded file (only used for metadata)
   * @param {ContentType} type - The type of content being uploaded (e.g. 'sermon', 'sermonBite')
   * @param {IUserDoc} user - The authenticated user initiating the upload
   *
   * @returns {Promise<UploadSession>} The newly created upload session document
   *
   * @throws {Error} If file is invalid or if S3/mongo operations fail
   */
  public async createUpload(file: {
    stream: PassThrough;
    streamForMetadata: PassThrough;
    info: { filename: string; mimeType: string };
    mimeType: string;
    fileName: string;
    size: number;
  }) {
    const uploadId = uuidv4();
    const s3Key = `sermons/${uploadId}/${file.info.filename}`;
  
    try {
      // Parse audio metadata
      const metadata = await parseStream(file.streamForMetadata, file.mimeType, {
        duration: true,
      });
  
      console.log("Metadata:", metadata);
  
      const audioMetadata: IAudioMetadata = {
        formatName: metadata.format.container,
        codec: metadata.format.codec,
        duration: metadata.format.duration,
        bitrate: metadata.format.bitrate,
        year: metadata.common.year,
      };
  
      // Upload to S3
      const multipartUpload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: s3Key,
          Body: file.stream,
          ContentType: file.mimeType,
        },
      });
  
      await multipartUpload.done();
  
      // Save upload session in DB
      const session = await UploadSession.create({
        uploadId,
        fileName: file.info.filename,
        fileSize: file.size,
        mimeType: file.mimeType,
        status: EUploadStatus.COMPLETED,
        s3Key,
        streamS3Prefix: `sermons/streaming/${uploadId}/`,
        metadata: audioMetadata,
        retryCount: 0,
        expiresAt: new Date(Date.now() + this.UPLOAD_EXPIRY),
      });
  
      return session;
    } catch (err) {
      file.stream.destroy();
      file.streamForMetadata.destroy();
      throw err;
    }
  }

  

  //utily functions
  public async validateFile(
    file: Express.Multer.File,
    type: ContentType
  ): Promise<boolean> {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return false;
    }

    // Check file type
    if (
      type === "sermon" &&
      !this.ALLOWED_AUDIO_TYPES.includes(file.mimetype)
    ) {
      return false;
    }

    // if (type === 'sermonBite' && !this.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    //   return false;
    // }

    return true;
  }

  public async validateUpload(data: UploadSermonDTO): Promise<IResult> {
    const allowedAudios = [
      "audio/mpeg",
      "audio/aac",
      "audio/wav",
      "audio/x-m4a",
    ];
  
    let result: IResult = { error: false, message: "", code: 200, data: {} };
  
    if (!data.file) {
      result.error = true;
      result.message = "Sermon file is required";
    } else if (data.file.size > this.MAX_FILE_SIZE) {
      result.error = true;
      result.message = "File too large";
    } else if (!data.user) {
      result.error = true;
      result.message = "Authentication is required";
    } else if (!data.type || !allowedAudios.includes(data.file.mimetype)) {
      result.error = true;
      result.message = `Invalid content type. Choose from ${allowedAudios.join(", ")}`;
    } else {
      result.error = false;
      result.message = "";
    }
  
    return result;
  }


  
}

export default new UploadSermonService();

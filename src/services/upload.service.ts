import {
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IUserDoc } from "../utils/interface.util";
import UploadSession from "../models/Upload.model";
import StorageService from "./storage.service";
import { IAudioMetadata, parseBuffer } from "music-metadata";
import { v4 as uuidv4 } from "uuid";
import { ContentType, EUploadStatus } from "../utils/enums.util";


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

  public async initiateUpload(
    file: Express.Multer.File,
    type: ContentType,
    user: IUserDoc
  ) {
    if (!this.validateFile(file, type)) {
      throw new Error("Invalid file type or size");
    }

    // extract audio metadata
    const data = await parseBuffer(file.buffer, file.mimetype);

    const audioMetadata: IAudioMetadata = {
      // @ts-ignore
      formatName: data.format.container,
      codec: data.format.codec,
      duration: data.format.duration,
      bitrate: data.format.bitrate,
      sampleRate: data.format.sampleRate,
      numberOfChannels: data.format.numberOfChannels,
      lossless: data.format.lossless,
      tags: {
        title: data.common.title,
        artist: data.common.artist,
        album: data.common.album,
        year: data.common.year,
        genre: data.common.genre,
        comment: data.common.comment,
        ...data.common, // optional: keep this if you want full tag support
      },
    };
    // Calculate chunks
    const chunkSize = this.CHUNK_SIZE;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = uuidv4();
    const s3Key = `uploads/sermons/${uploadId}/${file.originalname}`;

    // Create multipart upload in S3
    const multipartUpload = await this.s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        ContentType: file.mimetype,
      })
    );

    // Save upload session
    const session = await UploadSession.create({
      uploadId,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      chunkSize,
      totalChunks,
      uploadedChunks: [],
      status: EUploadStatus.PENDING,
      uploadedBy: user._id,
      multipartUploadId: multipartUpload.UploadId,
      s3Key,
      streamS3Prefix: "",
      metadata: audioMetadata,
      retryCount: 0,
      expiresAt: new Date(Date.now() + this.UPLOAD_EXPIRY),
    });

    return session;
  }



  //utily functions
  private validateFile(file: Express.Multer.File, type: ContentType): boolean {
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
}

export default new UploadSermonService();

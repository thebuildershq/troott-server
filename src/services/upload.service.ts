import {
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IUserDoc } from "../utils/interface.util";
import UploadSession from "../models/Upload.model";
import StorageService from "./storage.service";
import { v4 as uuidv4 } from "uuid";
import { ContentType } from "../utils/enums.util";

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
      throw new Error('Invalid file type or size');
    }

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

    //meta
    /**
     * name
     * year
     * fileType
     * size
     * container
     * Codec
     * bitrate
     * audioSampleRate
     * audioChannels
     * 
     * format
     * generic tags
     */

    // Save upload session
    const session = await UploadSession.create({
      uploadId,
      fileName: file.originalname,
      fileSize: file.,
      mimeType: file.mimetype,
      chunkSize,
      totalChunks,
      uploadedChunks: [],
      status: 'PENDING',  // or use your enum value
      uploadedBy: user._id,
      multipartUploadId: multipartUpload.UploadId,
      s3Key,
      streamS3Prefix: '', // fill if you use streaming or leave blank
      metadata,
      retryCount: 0,
      expiresAt: new Date(Date.now() + this.UPLOAD_EXPIRY),
    });

    return session;
  }

  async getUploadUrls(uploadId: string, chunkNumbers: number[]) {
    const session = await UploadSession.findOne({ uploadId });
    if (!session) throw new Error("Upload session not found");

    const urls = await Promise.all(
      chunkNumbers.map(async (partNumber) => {
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${session.s3Key}.part${partNumber}`,
          UploadId: session.multipartUploadId,
          PartNumber: partNumber,
        });

        const url = await getSignedUrl(this.s3Client, command, {
          expiresIn: 3600, // 1 hour
        });

        return { partNumber, url };
      })
    );

    return urls;
  }

  async handleChunkUploaded(uploadId: string, chunkNumber: number) {
    const session = await UploadSession.findOne({ uploadId });
    if (!session) throw new Error("Upload session not found");

    session.uploadedChunks.push(chunkNumber);
    session.status = "uploading";
    await session.save();

    if (session.uploadedChunks.length === session.totalChunks) {
      await this.completeUpload(session);
    }

    return session;
  }

  private async completeUpload(session: any) {
    try {
      session.status = "processing";
      await session.save();

      // Complete multipart upload
      const parts = await Promise.all(
        session.uploadedChunks.map(async (partNumber: number) => {
          const response = await this.s3Client.send(
            new HeadObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `${session.s3Key}.part${partNumber}`,
            })
          );
          return {
            PartNumber: partNumber,
            ETag: response.ETag,
          };
        })
      );

      await this.s3Client.send(
        new CompleteMultipartUploadCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: session.s3Key,
          UploadId: session.multipartUploadId,
          MultipartUpload: { Parts: parts },
        })
      );

      // Process the audio file
      const processResult = await this.storageService.processMediaFile(
        session.s3Key,
        "sermon"
      );

      // Create sermon record
      const sermon = await Sermon.create({
        title: session.fileName,
        sermonUrl: processResult.data.outputPath,
        // Add other required fields
      });

      session.status = "completed";
      await session.save();

      return sermon;
    } catch (error) {
      session.status = "failed";
      await session.save();
      throw error;
    }
  }

  //utily functions
  private validateFile(file: Express.Multer.File, type: ContentType): boolean {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return false;
    }

    // Check file type
    if (type === 'sermon' && !this.ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      return false;
    }

    // if (type === 'sermonBite' && !this.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    //   return false;
    // }

    return true;
  }

}

export default new UploadSermonService();

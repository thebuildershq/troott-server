// referral service logic
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { IResult } from '../utils/interface.util';
import UploadModel from '../models/Upload.model';

class UploadService {
  private s3Client: S3Client;
  private readonly CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  private readonly ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/aac', 'audio/wav'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
  private readonly MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  private readonly MAX_BULK_FILES = 10;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }

  public async initiateUpload(
    file: Express.Multer.File,
    userId: string,
    type: 'sermon' | 'sermonBite'
  ): Promise<IResult> {
    try {
      // Validate file
      if (!this.validateFile(file, type)) {
        throw new Error('Invalid file type or size');
      }

      const uploadId = uuidv4();
      const key = `${type}/${userId}/${uploadId}/${file.originalname}`;
      const numChunks = Math.ceil(file.size / this.CHUNK_SIZE);

      // Create multipart upload in S3
      const multipartUpload = await this.s3Client.send(
        new CreateMultipartUploadCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          ContentType: file.mimetype,
        })
      );

      // Save upload metadata
      await UploadModel.create({
        uploadId,
        userId,
        type,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        s3Key: key,
        s3UploadId: multipartUpload.UploadId,
        numChunks,
        completedChunks: [],
        status: 'initiated',
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
      });

      // Generate presigned URLs for each chunk
      const presignedUrls = await this.generateChunkUrls(
        key,
        multipartUpload.UploadId!,
        numChunks
      );

      return {
        error: false,
        message: 'Upload initiated successfully',
        code: 200,
        data: {
          uploadId,
          presignedUrls,
          numChunks
        }
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null
      };
    }
  }

  public async processUploadedFile(uploadId: string): Promise<IResult> {
    try {
      const upload = await UploadModel.findOne({ uploadId });
      if (!upload) {
        throw new Error('Upload not found');
      }

      // Verify all chunks are uploaded
      if (upload.completedChunks.length !== upload.numChunks) {
        throw new Error('All chunks not uploaded');
      }

      // Complete multipart upload
      await this.s3Client.send(
        new CompleteMultipartUploadCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: upload.s3Key,
          UploadId: upload.s3UploadId,
          MultipartUpload: {
            Parts: upload.completedChunks.map((etag, index) => ({
              ETag: etag,
              PartNumber: index + 1
            }))
          }
        })
      );

      // Process file based on type
      let processedUrl;
      if (upload.type === 'sermon') {
        processedUrl = await this.processAudioFile(upload.s3Key);
      } else {
        processedUrl = await this.processVideoFile(upload.s3Key);
      }

      // Update upload status
      upload.status = 'completed';
      upload.processedUrl = processedUrl;
      await upload.save();

      return {
        error: false,
        message: 'File processed successfully',
        code: 200,
        data: { url: processedUrl }
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null
      };
    }
  }

  private async processAudioFile(key: string): Promise<string> {
    // Process audio file (transcoding, normalization, etc.)
    const inputStream = await this.getFileStream(key);
    const outputKey = `processed/${key}`;

    await new Promise((resolve, reject) => {
      ffmpeg(inputStream)
        .toFormat('mp3')
        .audioBitrate('128k')
        .audioChannels(2)
        .audioFrequency(44100)
        .on('end', resolve)
        .on('error', reject)
        .pipe(this.createWriteStream(outputKey));
    });

    return this.generateSignedUrl(outputKey);
  }

  private async processVideoFile(key: string): Promise<string> {
    // Process video file (DASH streaming, thumbnails, etc.)
    const inputStream = await this.getFileStream(key);
    const outputKey = `processed/${key}`;

    await new Promise((resolve, reject) => {
      ffmpeg(inputStream)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-b:v:0 2000k',
          '-b:v:1 1000k',
          '-b:v:2 500k',
          '-b:a:0 128k',
          '-b:a:1 96k',
          '-b:a:2 64k',
          '-f dash',
          '-seg_duration 4',
          '-adaptation_sets "id=0,streams=v id=1,streams=a"'
        ])
        .on('end', resolve)
        .on('error', reject)
        .pipe(this.createWriteStream(outputKey));
    });

    return this.generateSignedUrl(outputKey);
  }

  // ... Helper methods (validateFile, generateChunkUrls, etc.)
  private validateFile(file: Express.Multer.File, type: 'sermon' | 'sermonBite'): boolean {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return false;
    }

    // Check file type
    if (type === 'sermon' && !this.ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      return false;
    }
    if (type === 'sermonBite' && !this.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      return false;
    }

    return true;
  }

  private async generateChunkUrls(
    key: string,
    uploadId: string,
    numChunks: number
  ): Promise<string[]> {
    const urls: string[] = [];

    for (let partNumber = 1; partNumber <= numChunks; partNumber++) {
      const command = new UploadPartCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600 // 1 hour
      });

      urls.push(url);
    }

    return urls;
  }

  private async getFileStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });

    const response = await this.s3Client.send(command);
    return response.Body as Readable;
  }

  private createWriteStream(key: string): Readable {
    const pass = new Readable();
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: pass
      }
    });

    upload.done().catch((err) => {
      console.error('Upload failed:', err);
    });

    return pass;
  }

  private async generateSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 3600 // 1 hour
    });
  }

  public async updateChunkStatus(
    uploadId: string,
    partNumber: number,
    etag: string
  ): Promise<IResult> {
    try {
      const upload = await UploadModel.findOne({ uploadId });
      if (!upload) {
        throw new Error('Upload not found');
      }

      // Update completed chunks
      upload.completedChunks[partNumber - 1] = etag;
      await upload.save();

      return {
        error: false,
        message: 'Chunk status updated',
        code: 200,
        data: {
          completedChunks: upload.completedChunks.length,
          totalChunks: upload.numChunks
        }
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null
      };
    }
  }

  public async bulkUpload(
    files: Express.Multer.File[],
    userId: string,
    type: 'sermon' | 'sermonBite'
  ): Promise<IResult> {
    try {
      if (files.length > this.MAX_BULK_FILES) {
        throw new Error(`Maximum ${this.MAX_BULK_FILES} files allowed for bulk upload`);
      }

      const uploadPromises = files.map(file => this.initiateUpload(file, userId, type));
      const results = await Promise.all(uploadPromises);

      return {
        error: false,
        message: 'Bulk upload initiated successfully',
        code: 200,
        data: {
          uploads: results.map(result => result.data)
        }
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null
      };
    }
  }

  public async resumeUpload(uploadId: string): Promise<IResult> {
    try {
      const upload = await UploadModel.findOne({ uploadId });
      if (!upload) {
        throw new Error('Upload not found');
      }

      // Generate new presigned URLs for remaining chunks
      const remainingChunks = Array.from(
        { length: upload.numChunks },
        (_, i) => i + 1
      ).filter(i => !upload.completedChunks[i - 1]);

      const presignedUrls = await this.generateChunkUrls(
        upload.s3Key,
        upload.s3UploadId,
        remainingChunks.length
      );

      return {
        error: false,
        message: 'Upload resume data generated',
        code: 200,
        data: {
          uploadId,
          presignedUrls,
          completedChunks: upload.completedChunks,
          remainingChunks
        }
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null
      };
    }
  }
}

export default new UploadService();
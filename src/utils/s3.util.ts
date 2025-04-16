import { S3Client, PutObjectCommand, GetObjectCommand,   HeadObjectCommand, 
    ListPartsCommand, 
    ListMultipartUploadsCommand, 
    AbortMultipartUploadCommand, DeleteObjectCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import * as ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { IResult } from './interface.util';

class S3Utility {
  private s3Client: S3Client;
  private readonly ALLOWED_TYPES = {
    video: ['video/mp4', 'video/quicktime'],
    audio: ['audio/mp3', 'audio/aac', 'audio/wav']
  };
  private readonly MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
  private readonly URL_EXPIRATION = 3600; // 1 hour

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }

  public async generatePresignedUploadUrl(
    fileName: string,
    fileType: string,
    metadata: Record<string, string>
  ): Promise<IResult> {
    try {
      if (!this.validateUploadType(fileType)) {
        throw new Error('Invalid file type');
      }

      const sanitizedMetadata = this.sanitizeFileMetadata(metadata);
      const key = `uploads/${uuidv4()}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        Metadata: sanitizedMetadata,
        ServerSideEncryption: 'AES256'
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.URL_EXPIRATION
      });

      return {
        error: false,
        message: 'Upload URL generated successfully',
        code: 200,
        data: { url, key }
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

  public async generatePresignedDownloadUrl(key: string): Promise<IResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.URL_EXPIRATION
      });

      return {
        error: false,
        message: 'Download URL generated successfully',
        code: 200,
        data: { url }
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

  private sanitizeFileMetadata(metadata: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(metadata)) {
      // Remove special characters and limit length
      const sanitizedKey = key.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 128);
      const sanitizedValue = value.replace(/[^a-zA-Z0-9-_\s]/g, '').slice(0, 256);
      sanitized[sanitizedKey] = sanitizedValue;
    }
    return sanitized;
  }

  private validateUploadType(fileType: string): boolean {
    return [...this.ALLOWED_TYPES.video, ...this.ALLOWED_TYPES.audio].includes(fileType);
  }

  public async setBucketPolicies(): Promise<IResult> {
    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AllowCORS',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${process.env.AWS_BUCKET_NAME}/*`],
            Condition: {
              StringLike: {
                'aws:Referer': [process.env.ALLOWED_ORIGINS]
              }
            }
          }
        ]
      };

      await this.s3Client.send(new PutBucketPolicyCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Policy: JSON.stringify(policy)
      }));

      return {
        error: false,
        message: 'Bucket policies updated successfully',
        code: 200,
        data: null
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

  public async deleteS3Object(key: string): Promise<IResult> {
    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      }));

      return {
        error: false,
        message: 'Object deleted successfully',
        code: 200,
        data: null
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

  public async transcodeToHLSorDASH(key: string): Promise<IResult> {
    try {
      const inputUrl = await this.generatePresignedDownloadUrl(key);
      const outputKey = `transcoded/${key}`;

      await new Promise((resolve, reject) => {
        ffmpeg(inputUrl.data.url)
          .outputOptions([
            '-c:v libx264',
            '-c:a aac',
            '-f dash',
            '-seg_duration 4',
            '-adaptation_sets "id=0,streams=v id=1,streams=a"'
          ])
          .output(`s3://${process.env.AWS_BUCKET_NAME}/${outputKey}/manifest.mpd`)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      return {
        error: false,
        message: 'Transcoding completed successfully',
        code: 200,
        data: { outputKey }
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

  public async generateOptimizedPreview(key: string): Promise<IResult> {
    try {
      const inputUrl = await this.generatePresignedDownloadUrl(key);
      const thumbnailKey = `thumbnails/${key}.jpg`;
      const previewKey = `previews/${key}.mp4`;

      // Generate thumbnail
      await new Promise((resolve, reject) => {
        ffmpeg(inputUrl.data.url)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: thumbnailKey,
            folder: `s3://${process.env.AWS_BUCKET_NAME}/thumbnails`
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Generate preview
      await new Promise((resolve, reject) => {
        ffmpeg(inputUrl.data.url)
          .output(`s3://${process.env.AWS_BUCKET_NAME}/${previewKey}`)
          .duration(10)
          .size('480x?')
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      return {
        error: false,
        message: 'Preview generated successfully',
        code: 200,
        data: { thumbnailKey, previewKey }
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

  public async tagUploads(key: string, tags: Record<string, string>): Promise<IResult> {
    try {
      const sanitizedTags = this.sanitizeFileMetadata(tags);
      await this.s3Client.send(new PutObjectTaggingCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Tagging: {
          TagSet: Object.entries(sanitizedTags).map(([key, value]) => ({
            Key: key,
            Value: value
          }))
        }
      }));

      return {
        error: false,
        message: 'Tags added successfully',
        code: 200,
        data: null
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


  // Add these methods to your S3Utility class

  public async uploadViaPresignedUrl(file: Buffer, presignedUrl: string): Promise<IResult> {
    try {
      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      return {
        error: false,
        message: 'File uploaded successfully',
        code: 200,
        data: null
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

  public async storeFileMetadataInDB(
    key: string,
    metadata: Record<string, any>
  ): Promise<IResult> {
    try {
      const fileStats = await this.s3Client.send(new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      }));

      const fileMetadata = {
        key,
        size: fileStats.ContentLength,
        type: fileStats.ContentType,
        lastModified: fileStats.LastModified,
        ...metadata
      };

      // Store in your MongoDB model
      await FileMetadata.create(fileMetadata);

      return {
        error: false,
        message: 'File metadata stored successfully',
        code: 200,
        data: fileMetadata
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

  public async resumeUploadIfFailed(uploadId: string): Promise<IResult> {
    try {
      const upload = await this.s3Client.send(new ListPartsCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uploadId,
        UploadId: uploadId
      }));

      const completedParts = upload.Parts || [];
      const nextPartNumber = completedParts.length + 1;

      return {
        error: false,
        message: 'Upload can be resumed',
        code: 200,
        data: {
          nextPartNumber,
          completedParts
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

  public async autodeleteUnfinishedUploads(): Promise<IResult> {
    try {
      const incompleteUploads = await this.s3Client.send(new ListMultipartUploadsCommand({
        Bucket: process.env.AWS_BUCKET_NAME
      }));

      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

      for (const upload of incompleteUploads.Uploads || []) {
        if (upload.Initiated && upload.Initiated < sixHoursAgo) {
          await this.s3Client.send(new AbortMultipartUploadCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: upload.Key,
            UploadId: upload.UploadId
          }));
        }
      }

      return {
        error: false,
        message: 'Unfinished uploads cleaned up successfully',
        code: 200,
        data: null
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

  public async loadLowLatencyFiles(key: string): Promise<IResult> {
    try {
      const previewKey = `previews/${key}`;
      const fullKey = `processed/${key}`;

      // Get preview URL first
      const previewUrl = await this.generatePresignedDownloadUrl(previewKey);
      
      // Then get full version URL
      const fullUrl = await this.generatePresignedDownloadUrl(fullKey);

      return {
        error: false,
        message: 'URLs generated successfully',
        code: 200,
        data: {
          previewUrl: previewUrl.data.url,
          fullUrl: fullUrl.data.url
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

export default new S3Utility();
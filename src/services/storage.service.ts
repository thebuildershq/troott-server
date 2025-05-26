import { S3Client, DeleteObjectCommand, GetObjectCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IResult } from '../utils/interface.util';

class StorageService {
  private s3Client: S3Client;
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

  public async getSignedUrl(key: string): Promise<IResult> {
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
        message: 'URL generated successfully',
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

  public async deleteFile(key: string): Promise<IResult> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key
        })
      );

      return {
        error: false,
        message: 'File deleted successfully',
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

}

export default new StorageService();
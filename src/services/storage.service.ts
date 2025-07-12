import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutBucketPolicyCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, AWS_BUCKET_NAME } from "../config/aws.config"; // use the shared config
import { IResult } from "../utils/interface.util";

class StorageService {
  private s3Client: S3Client = s3;
  private bucket = AWS_BUCKET_NAME;
  private readonly URL_EXPIRATION = 3600; // 1 hour

  public async getSignedUrl(key: string): Promise<IResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.URL_EXPIRATION,
      });

      return {
        error: false,
        message: "URL generated successfully",
        code: 200,
        data: { url },
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null,
      };
    }
  }

  public async deleteFile(key: string): Promise<IResult> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      return {
        error: false,
        message: "File deleted successfully",
        code: 200,
        data: null,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null,
      };
    }
  }

  public async setBucketPolicies(): Promise<IResult> {
    try {
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "AllowCORS",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
            Condition: {
              StringLike: {
                "aws:Referer": [process.env.ALLOWED_ORIGINS],
              },
            },
          },
        ],
      };

      await this.s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify(policy),
        })
      );

      return {
        error: false,
        message: "Bucket policies updated successfully",
        code: 200,
        data: null,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message,
        code: 500,
        data: null,
      };
    }
  }

  public async deleteS3Object(key: string): Promise<IResult> {
    return this.deleteFile(key); // reuse the same logic
  }
}

export default new StorageService();

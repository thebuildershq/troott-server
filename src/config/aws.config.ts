import { S3Client } from "@aws-sdk/client-s3";
import { ENVType } from "../utils/enums.util";
import { AWSConfig } from "../utils/interface.util";

let config: AWSConfig;

switch (process.env.NODE_ENV) {
  case ENVType.PRODUCTION:
    config = {
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      bucketName: process.env.AWS_BUCKET_NAME!,
    };

    break;

  case ENVType.STAGING:
    config = {
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      bucketName: process.env.AWS_STAGING_BUCKET_NAME!,
    };

    break;

  case ENVType.DEVELOPMENT:
    config = {
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      bucketName: process.env.AWS_DEV_BUCKET_NAME!,
    };

    break;

  default:
    throw new Error("Invalid NODE_ENV. AWS config not set.");
}

export const s3 = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

export const AWS_BUCKET_NAME = config.bucketName;

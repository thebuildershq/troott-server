import {
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  IAudioMetadata,
  IResult,
  ISermonDoc,
  IUserDoc,
} from "../utils/interface.util";
import UploadSession from "../models/Upload.model";
import StorageService from "./storage.service";
import { parseBuffer, parseStream } from "music-metadata";
import { v4 as uuidv4 } from "uuid";
import { ContentType, EUploadStatus } from "../utils/enums.util";
import { PublishSermonDTO, UploadSermonDTO } from "../dtos/sermon.dto";
import { PassThrough } from "stream";
import { Upload } from "@aws-sdk/lib-storage";
import sermonRepository from "../repositories/sermon.repository";
import Sermon from "../models/Sermon.model";

class SermonService {
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

  //JSDoc

  public async handleUpload(file: {
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
      const metadata = await parseStream(
        file.streamForMetadata,
        file.mimeType,
        {
          duration: true,
        }
      );

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

  // let result: IResult = { error: false, message: "", code: 200, data: null };

  public async handlePublish(data: PublishSermonDTO): Promise<ISermonDoc> {
    const {
      uploadId,
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      category,
      tags,
      isPublic,
      isSeries,
      uploadedBy,
    } = data;

    const session = await sermonRepository.findByUploadId(uploadId)
    if (!session) {
      throw new Error("Sermon already exist");
    }

    let sermon: ISermonDoc = await Sermon.create({
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      category,
      tags,
      isPublic,
      isSeries,
      uploadedBy,
      uploadId,
    });

    await sermon.save();

    return sermon;
      
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
      result.message = `Invalid content type. Choose from ${allowedAudios.join(
        ", "
      )}`;
    } else {
      result.error = false;
      result.message = "";
    }

    return result;
  }
}

export default new SermonService();

/**Switch to manual multipart logic
Add logic to:
Start multipart
Upload each chunk manually
Resume from the last good chunk
Complete the multipart session 

Handles:
Metadata extraction using music-metadata
Uploading original audio to S3
Creating initial upload session in MongoDB (status: PENDING)
Methodsz
extractAudioMetadata(stream)
uploadOriginal(stream, fileInfo)
createUploadSession(data)

Processing logic
After upload completes successfully, offload to a queue/job runner (like BullMQ).

Handles:
Transcoding into various bitrates using FFmpeg (@ffmpeg/ffmpeg or spawn)
Uploading processed audio chunks to a CloudFront-backed S3 prefix
Updating session in MongoDB (status: PROCESSING -> READY)

Methods:
transcodeAndUploadToBitrates(uploadSession)
generateHLSManifest() or generateDashManifest() (optional, if you go adaptive)
updateUploadStatus(uploadId, status)

4. PublishService
Handles:
Making the processed sermon publicly accessible
Updating visibility or status fields in MongoDB
Optionally, generating pre-signed CDN URLs or attaching sermon to a Series, Preacher, etc.

 5. Job Queue (e.g. BullMQ)
After UploadService.createUpload() finishes, enqueue a job for 
ProcessingService.transcodeAndUploadToBitrates()
Make this a separate worker process to avoid blocking your main app

*/

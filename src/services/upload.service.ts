import { S3Client } from "@aws-sdk/client-s3";
import {
  IResult,
  ISermonDoc,
  IUploadDoc,
  IUserDoc,
} from "../utils/interface.util";
import UploadSession from "../models/Upload.model";
import StorageService from "./storage.service";
import mm from "music-metadata";
import { v4 as uuidv4 } from "uuid";
import { ContentType, EUploadStatus, FileType } from "../utils/enums.util";
import { PublishSermonDTO, UploadSermonDTO } from "../dtos/sermon.dto";
import { PassThrough } from "stream";
import { Upload } from "@aws-sdk/lib-storage";
import sermonRepository from "../repositories/sermon.repository";
import Sermon from "../models/Sermon.model";
import { determineFileType } from "../utils/helper.util";
import sharp from "sharp";

class UploadService {
  private s3Client: S3Client;
  private storageService: typeof StorageService;
  private readonly UPLOAD_EXPIRY = 6 * 60 * 60 * 1000;
  private readonly ALLOWED_AUDIO_TYPES = [
    "audio/mpeg",
    "audio/aac",
    "audio/wav",
    "audio/x-m4a",
  ];

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

  //validate da
  // Upload and publish logic
  // update sermon and published

  public async handleUpload(file: {
    stream: PassThrough;
    streamForMetadata: PassThrough;
    info: { filename: string; mimeType: string };
    mimeType: string;
    fileName: string;
    size: number;
  }): Promise<IUploadDoc> {
    const fileType = determineFileType(file.mimeType as string);
    
    const uploadId = uuidv4();
    const s3Key = `uploads/${fileType.toLowerCase()}/${uploadId}/${
      file.info.filename
    }`;

    try {
      // Upload to S3
      const s3Upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: s3Key,
          Body: file.stream,
          ContentType: file.mimeType,
        },
      });

      //s3 is supposed to return data here
      const s3Response = await s3Upload.done();
      

      let metadata: any = {};

      if (fileType === FileType.AUDIO) {
        metadata = await this.extractAudioMetadata(
          file.streamForMetadata,
          file.mimeType
        );
      } else if (fileType === FileType.IMAGE) {
        metadata = await this.extractImageMetadata(file.streamForMetadata);
      } else if (fileType === FileType.VIDEO) {
        metadata = await this.extractVideoMetadata(file.streamForMetadata);
      } else if (fileType === FileType.DOCUMENT) {
        metadata = await this.extractDocumentMetadata(file.streamForMetadata);
      }

      // Save upload session in DB
      const uploadResult = await UploadSession.create({
        uploadId,
        fileName: file.info.filename,
        fileSize: file.size,
        mimeType: file.mimeType,
        fileType,
        s3Key,
        s3Url: s3Response.Location,
        metadata: { metadataType: fileType, ...metadata },
        status: EUploadStatus.COMPLETED,
        retryCount: 0,
        expiresAt: new Date(Date.now() + this.UPLOAD_EXPIRY),
      });

      // status: EUploadStatus.COMPLETED,
      return uploadResult;
    } catch (err) {
      file.stream.destroy();
      file.streamForMetadata.destroy();
      throw err;
    }
  }

  // let result: IResult = { error: false, message: "", code: 200, data: null };

  public async handleSermonPublish(
    data: PublishSermonDTO
  ): Promise<ISermonDoc> {
    const {
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      topic,
      tags,
      isPublic,
      isSeries,
      preacherId,
      uploadedBy,
    } = data;

    // const session = await sermonRepository.findBySermonUrl(sermonUrl)
    // if (session) {
    //   throw new Error("Sermon not found");
    // }

    let sermon: ISermonDoc = await Sermon.create({
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      topic,
      tags,
      isPublic,
      isSeries,
      preacher: preacherId,
      uploadedBy,
    });

    await this.attachAppUrl(sermon);

    await sermon.save();

    return sermon;
  }

  //utily functions
  public async validateFile(
    file: Express.Multer.File,
    type: ContentType
  ): Promise<boolean> {
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

  public async validateSermonUpload(data: UploadSermonDTO): Promise<IResult> {
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

  private async extractAudioMetadata(
    streamForMetadata: PassThrough,
    mimeType: string
  ) {
    const metadata = await mm.parseStream(streamForMetadata, mimeType, {
      duration: true,
    });
    return {
      metadataType: FileType.AUDIO,
      formatName: metadata.format.container,
      codec: metadata.format.codec,
      duration: metadata.format.duration,
      bitrate: metadata.format.bitrate,
      year: metadata.common.year,
    };
  }

  private async extractImageMetadata(streamForMetadata: PassThrough) {
    const image = sharp();
    streamForMetadata.pipe(image);

    const metadata = await image.metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    };
  }

  private async extractDocumentMetadata(streamForMetadata: PassThrough) {
    // const buffer = await this.streamToBuffer(streamForMetadata);
    // const data = await pdfParse(buffer);
    // return {
    //   pageCount: data.numpages,
    //   author: data.info.Author,
    //   title: data.info.Title,
    //   language: data.info.Language,
    // };
  }

  private extractVideoMetadata(streamForMetadata: PassThrough) {
    // return new Promise((resolve, reject) => {
    //   const tmpPath = `/tmp/${uuidv4()}.mp4`;
    //   const ff = ffmpeg(streamForMetadata).ffprobe((err, data) => {
    //     if (err) return reject(err);
    //     const videoStream = data.streams.find((s) => s.codec_type === "video");
    //     resolve({
    //       resolution: `${videoStream?.width}x${videoStream?.height}`,
    //       codec: videoStream?.codec_name,
    //       duration: data.format.duration,
    //       framerate: eval(videoStream?.r_frame_rate || "0"),
    //     });
    //   });
    // });
  }

  public async validateSermonPublish(data: PublishSermonDTO): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    if (!data.uploadId) {
      result.error = true;
      result.message = "Upload ID is required";
    } else if (!data.title) {
      result.error = true;
      result.message = "Title is required";
    } else if (!data.description) {
      result.error = true;
      result.message = "Description is required";
    } else if (!data.duration) {
      result.error = true;
      result.message = "Duration is required";
    } else if (!data.releaseDate) {
      result.error = true;
      result.message = "Release date is required";
    } else if (!data.releaseYear) {
      result.error = true;
      result.message = "Release year is required";
    } else if (!data.sermonUrl) {
      result.error = true;
      result.message = "Sermon URL is required";
    } else if (!data.imageUrl) {
      result.error = true;
      result.message = "Image URL is required";
    } else if (!data.topic) {
      result.error = true;
      result.message = "topic is required";
    } else if (!data.tags) {
      result.error = true;
      result.message = "Tags are required";
    } else if (!data.isPublic) {
      result.error = true;
      result.message = "Visibility is required";
    } else if (!data.isSeries) {
      result.error = true;
      result.message = "Series status is required";
    } else if (!data.uploadedBy) {
      result.error = true;
      result.message = "Uploaded by is required";
    } else {
      result.error = false;
      result.message = "";
    }

    return result;
  }

  public async attachAppUrl(
    sermon: ISermonDoc,
    appUrl?: string
  ): Promise<void> {
    const baseUrl = appUrl || (process.env.CLIENT_APP_URL as string);

    const sermonExist = await sermonRepository.findBySermonId(sermon._id);
    if (!sermonExist) {
      throw new Error("Sermon not found");
    }

    const shareableUrl = `${baseUrl}/sermons/${sermon._id}`;
    sermon.shareableUrl = shareableUrl;

    await sermon.save();
  }

  public async streamToBuffer(streamForMetadata: PassThrough): Promise<void> {}

  public async increaseSermonLikes(): Promise<void> {}
  public async increaseSermonPlayCount(): Promise<void> {}

  public async updateSermonState(): Promise<void> {}

  public async updateSermonStatus(): Promise<void> {}
}

export default new UploadService();

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

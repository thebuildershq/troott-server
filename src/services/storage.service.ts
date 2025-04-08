import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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

  
  public async processMediaFile(key: string, type: 'sermon' | 'sermonBite'): Promise<IResult> {
    try {
      const inputUrl = await this.getSignedUrl(key);
      const outputPath = `processed/${type}/${path.basename(key)}`;

      if (type === 'sermon') {
        await this.processSermon(inputUrl.data.url, outputPath);
      } else {
        await this.processSermonBite(inputUrl.data.url, outputPath);
      }

      return {
        error: false,
        message: 'Media processed successfully',
        code: 200,
        data: { outputPath }
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

  private async processSermon(inputUrl: string, outputPath: string): Promise<void> {
    // Extract audio and create HLS stream
    await new Promise((resolve, reject) => {
      ffmpeg(inputUrl)
        .outputOptions([
          '-c:a aac',
          '-b:a 128k',
          '-ar 44100',
          '-f hls',
          `-hls_time ${this.HLS_SEGMENT_DURATION}`,
          '-hls_list_size 0',
          '-hls_segment_filename',
          `${outputPath}_%03d.ts`
        ])
        .output(`${outputPath}/playlist.m3u8`)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Generate waveform data
    await this.generateWaveform(inputUrl, `${outputPath}/waveform.json`);
  }

  private async processSermonBite(inputUrl: string, outputPath: string): Promise<void> {
    // Create DASH stream with multiple qualities
    await new Promise((resolve, reject) => {
      ffmpeg(inputUrl)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-b:v:0 2000k',
          '-b:v:1 1000k',
          '-b:v:2 500k',
          '-b:a:0 128k',
          '-s:v:0 1280x720',
          '-s:v:1 854x480',
          '-s:v:2 640x360',
          '-f dash',
          '-seg_duration 4',
          '-adaptation_sets "id=0,streams=v id=1,streams=a"'
        ])
        .output(`${outputPath}/manifest.mpd`)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Generate thumbnails
    await this.generateThumbnails(inputUrl, outputPath);
  }

  private async generateWaveform(inputUrl: string, outputPath: string): Promise<void> {
    await new Promise((resolve, reject) => {
      ffmpeg(inputUrl)
        .outputOptions([
          '-filter_complex',
          'aformat=channel_layouts=mono,showwavespic=s=640x120:colors=#9cf42f',
          '-frames:v 1'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  private async generateThumbnails(inputUrl: string, outputPath: string): Promise<void> {
    await new Promise((resolve, reject) => {
      ffmpeg(inputUrl)
        .screenshots({
          timestamps: ['00:00:01', '25%', '50%', '75%'],
          filename: 'thumbnail-%i.jpg',
          folder: outputPath,
          size: '320x180'
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }

  public async extractAudioBite(
    key: string,
    startTime: string,
    duration: string
  ): Promise<IResult> {
    try {
      const inputUrl = await this.getSignedUrl(key);
      const outputPath = `bites/audio/${path.basename(key)}_${Date.now()}.mp3`;

      await new Promise((resolve, reject) => {
        ffmpeg(inputUrl.data.url)
          .setStartTime(startTime)
          .setDuration(duration)
          .outputOptions([
            '-c:a libmp3lame',
            '-q:a 2',
            '-ar 44100'
          ])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      return {
        error: false,
        message: 'Audio bite extracted successfully',
        code: 200,
        data: { outputPath }
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

  public async optimizeForMobile(key: string): Promise<IResult> {
    try {
      const inputUrl = await this.getSignedUrl(key);
      const outputPath = `mobile/${path.basename(key)}`;

      await new Promise((resolve, reject) => {
        ffmpeg(inputUrl.data.url)
          .outputOptions([
            '-c:v libx264',
            '-preset medium',
            '-crf 23',
            '-c:a aac',
            '-b:a 128k',
            '-movflags +faststart',
            '-vf scale=-2:720'
          ])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      return {
        error: false,
        message: 'File optimized for mobile successfully',
        code: 200,
        data: { outputPath }
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
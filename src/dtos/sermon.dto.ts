import { ObjectId } from "mongoose";
import { ContentType, EContentState, EContentStatus } from "../utils/enums.util";
import { IAudioMetadata, IUserDoc } from "../utils/interface.util";

export interface UploadSermonDTO {
  type: ContentType;
  file?: Express.Multer.File;
  user: IUserDoc;
}

export interface PublishSermonDTO {
  uploadId?: string;
  title: string;
  description: string;
  duration: number;
  releaseDate: Date;
  releaseYear: number;
  sermonUrl: string;
  imageUrl: string;
  category: Array<string>;
  tags: Array<string>;
  isPublic: boolean;
  isSeries: boolean;
  preacherId: ObjectId;
  uploadedBy: ObjectId;

}


 export interface UpdateSermonDTO {
    id: string;
  
    title?: string;
    description?: string;
    duration?: number;
    releaseDate?: Date;
    releaseYear?: number;
    sermonUrl?: string;
    imageUrl?: string;
    size?: number;
  
    category?: string;
    tags?: Array<string>;
    isPublic?: boolean;
    shareableUrl?: string;
  
    isSeries?: boolean;
    series?: Array<ObjectId>;
  
    state?: EContentState;
    status?: EContentStatus;
  
    preacher?: ObjectId;
    playlist?: ObjectId;
    publishedBy?: ObjectId;
  
    versionId?: ObjectId;
    changesSummary?: string;
  
    uploadRef?: ObjectId;
    uploadSummary?: {
      fileName?: string;
      fileSize?: number;
      mimetype?: string;
      s3Key?: string;
      s3Url?: string;
      metadata?: IAudioMetadata;
      uploadedBy?: ObjectId;
    };
}

export interface DeleteSermonDTO {
  id: string;
  state?: EContentState;
  status?: EContentStatus;
  publishedBy?: ObjectId;
}

export interface SermonDTO {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: Array<string>;
  sermonUrl: string;
  imageUrl: string;
  tags: Array<string>;
  isPublic: boolean;
  totalPlay: number;
  totalShares: number;
  isSeries: boolean;
  state: string;
  status: string;
  preacher: string;
  series?: string;
  staff?: string;
  playlist?: string;
  library?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

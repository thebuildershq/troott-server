import { ObjectId } from "mongoose";
import { ContentType } from "../utils/enums.util";
import { IUserDoc } from "../utils/interface.util";

export interface UploadSermonDTO {
  type: ContentType;
  file?: Express.Multer.File;
  user: IUserDoc;
}

export interface PublishSermonDTO {
  uploadId: string;
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
  uploadedBy: ObjectId;

}



export interface EditSermonDTO {
  title?: string;
  description?: string;
  preacher?: string;
  duration?: number; // In seconds
  category?: Array<string>;
  sermonUrl?: string;
  imageUrl?: string;
  tags?: Array<string>;
  isPublic?: boolean;
  isSeries?: boolean;
  state?: string;
  status?: string;
  modifiedBy: string;
  changesSummary: string;
}

export interface DeletedSermonDTO {
  id: string;
  deletedBy: string;
  deletedAt: Date;
  reason?: string;
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

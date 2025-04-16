import { EContentState, EContentStatus } from "../utils/enums.util";

export interface CreateSermonBiteDTO {
    title: string;
    description: string;
    duration: number; // in seconds
    category: string[];
    biteURL: string;
    thumbnailUrl?: string;
    tags: string[];
  
    isPublic: boolean;
    state: EContentState;
    status: EContentStatus;
  
    preacher: string;
    creator?: string;
    playlist?: string[];
  }
  

  export interface EditSermonBiteDTO {
    title?: string;
    description?: string;
    category?: string[];
    thumbnailUrl?: string;
    tags?: string[];
  
    isPublic?: boolean;
    state?: EContentState;
    status?: EContentStatus;
  }
  

  export interface SermonBiteDTO {
    id: string;
    title: string;
    description: string;
    duration: number;
    category: string[];
    biteURL: string;
    thumbnailUrl?: string;
    tags: string[];
  
    isPublic: boolean;
    state: EContentState;
    status: EContentStatus;
  
    preacher: string;
    creator?: string;
    playlist?: string[];
  
    engagementStats: SermonBiteEngagementDTO;
  
    createdAt: string;
    updatedAt: string;
  }

  export interface SermonBiteEngagementDTO {
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalSaves: number;
  }
  
  
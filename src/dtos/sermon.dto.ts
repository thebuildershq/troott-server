export interface CreateSermonDTO {
  title: string;
  description: string;
  preacher: string;
  duration: number; // In seconds
  category: Array<string>;
  sermonUrl: string;
  imageUrl: string;
  tags: Array<string>;
  isPublic: boolean;
  isSeries: boolean;
  series?: string;
  staff?: string;
  playlist?: string;
  library?: string;
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

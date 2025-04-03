export interface CreateStaffDTO {
    firstName: string;
    lastName: string;
    email: string;
  
    gender: string;
    avatar?: string;
    dateOfBirth: Date;
    country: string;
    phoneNumber: string;
    phoneCode: string;
    location: ILocationInfo;
    slug: string;
  
    unit: EStaffUnit;
    role: EStaffRole;
    accessLevel: number;
    permissions: Array<EStaffPermissions>;
  
    isActive: boolean;
  }

  
  export interface EditStaffDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
  
    gender?: string;
    avatar?: string;
    dateOfBirth?: Date;
    country?: string;
    phoneNumber?: string;
    phoneCode?: string;
    location?: ILocationInfo;
    slug?: string;
  
    unit?: EStaffUnit;
    role?: EStaffRole;
    accessLevel?: number;
    permissions?: Array<EStaffPermissions>;
  
    isActive?: boolean;
    isSuspended?: boolean;
    isDeleted?: boolean;
  }
  

  export interface StaffProfileDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  
    gender: string;
    avatar?: string;
    dateOfBirth?: Date;
    country: string;
    phoneNumber: string;
    phoneCode: string;
    location: ILocationInfo;
    slug: string;
  
    unit: EStaffUnit;
    role: EStaffRole;
    accessLevel: number;
    permissions: Array<EStaffPermissions>;
  
    lastLogin: Date;
    devices: Array<{ deviceId: string; deviceType: string; lastUsed: Date }>;
  
    publishedCount: number;
    isVerified: boolean;
    isActive: boolean;
    isSuspended: boolean;
  
    createdAt: string;
    updatedAt: string;
  }
  
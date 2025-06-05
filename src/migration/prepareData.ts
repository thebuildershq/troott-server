
async function preparePreacherData(params:type) {
    export interface IPreacherDoc extends Document {
        firstName: string;
        lastName: string;
        email: string;
        //user: string;
        phoneNumber: string;
        phoneCode: string;
        country: string;
        countryPhone: string;
      
        avatar: string;
        dateOfBirth: Date;
        gender: string;
        slug: string;
      
        // Ministry & Content
        description: string;
        ministry: string;
        sermons: Array<ObjectId | any>;
        featuredSermons: Array<ObjectId | any>;
        bites: Array<ObjectId | any>;
        topSermons: Array<ObjectId | any>;
        topBites: Array<ObjectId | any>;
      
        // Playlist System
        playlists: Array<ObjectId | any>; // Playlists created by the preacher
        featuredPlaylists: Array<ObjectId | any>;
      
        // Followers & Listeners
        followers: Array<ObjectId | any>;
        monthlyListeners: number;
        likes: number;
        shares: number;
      
        // Uploads & Publications
        uploads: Array<ObjectId | any>;
        uploadHistory: Array<ObjectId | any>;
      
        // Security & Verification
        identification: Array<string>;
        verificationStatus: EVerificationStatus;
        isVerified: boolean;
        verifiedAt: Date;
      
        // Account Managers
        accountManagers: Array<{ userId: ObjectId; role: EAccountManagerRole }>;
      
        //relationships
        user: ObjectId | any;
        transactions: Array<ObjectId | any>;
        createdBy: ObjectId | any;
        deletedSermons: Array<{
          id: ObjectId;
          deletedBy: ObjectId | any;
          deletedAt: Date;
          reason?: string;
        }>;
      
        // time stamps
        createdAt: string;
        updatedAt: string;
        _version: number;
        _id: ObjectId;
        id: ObjectId;
      }4
}



async function prepareSermonData(
  link: IDownloadLink,
  uploadResult: IUploadDoc,
  metadata: any
): Promise<PublishSermonDTO> {
  // Find or create preacher
  const preacher = await Preacher.findOne({
    $or: [
      { ministry: "Eternity Network International" },
      { firstName: "Joshua", lastName: "Selman" },
    ],
  });

  if (!preacher) {
    throw new Error(
      "Preacher not found. Please create a preacher profile first."
    );
  }

  // Extract year from title or use current year as fallback
  const yearMatch = link.title.match(/\b20\d{2}\b/);
  const releaseYear = yearMatch
    ? parseInt(yearMatch[0])
    : new Date().getFullYear();

  // Extract topic from title
  const topicMatch = link.title.match(/- ([^-]+)$/);
  const topic = topicMatch ? [topicMatch[1].trim()] : [];

  // Prepare tags
  const tags = [
    "Apostle Joshua Selman",
    releaseYear.toString(),
    ...topic,
  ].filter(Boolean);

  return {
    title: link.title,
    description: `Sermon by Apostle Joshua Selman - ${link.title}`,
    duration: metadata?.duration || 0,
    releaseDate: new Date(),
    releaseYear,
    sermonUrl: uploadResult.s3Url,
    imageUrl: preacher.avatar || "", // Use preacher's avatar as default image
    topic,
    tags,
    isPublic: true,
    isSeries: false,
    preacherId: preacher._id,
    uploadedBy: preacher._id, // For migration purposes, using preacher as uploader
  };
}

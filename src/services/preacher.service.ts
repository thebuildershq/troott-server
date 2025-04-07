import { createPreacherProfileDTO, updatePreacherProfileDTO } from "../dtos/profile.dto";
import Preacher from "../models/Preacher.model";
import { IPreacherProfileDoc, IResult, IUserDoc } from "../utils/interface.util";
import { EUserType, EVerificationStatus } from "../utils/enums.util";
import { generateRandomChars } from "../utils/helper.util";
import { ObjectId } from "mongoose";

class PreacherService {



  public async createPreacherProfile(
    data: createPreacherProfileDTO
  ): Promise<{ preacher: IPreacherProfileDoc; user: IUserDoc }> {
    const { firstName, lastName, email, gender, avatar, user }: createPreacherProfileDTO = data;

    const existingPreacher = await Preacher.findOne({ user: user._id });
    if (existingPreacher) {
      throw new Error("Preacher profile already exists for this user");
    }

    const preacherID = generateRandomChars(12);

    const preacherProfileData = {
      _id: user._id,
      id: user.id,
      preacherID: preacherID,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      gender: gender,
      avatar: avatar,
      type: EUserType.PREACHER,
      user: user._id,
      isActive: true,
      isSuspended: false,
      isDeleted: false,
      createdBy: user._id,
      ministry: "",
      description: "",
      monthlyListeners: 0,
      likes: 0,
      shares: 0,
      publishedCount: 0,
      verificationStatus: EVerificationStatus.PENDING,
      isVerified: false,
      verifiedAt: null,
      twoFactorEnabled: false,
      lastLogin: new Date()
    };

    const preacher = await Preacher.create(preacherProfileData);

    user.profiles = {
      ...user.profiles,
      preacher: preacher._id,
    };
    await user.save();

    return { preacher, user };
  }

  public async updatePreacherProfile(
    id: ObjectId,
    data: Partial<IPreacherProfileDoc>
  ): Promise<IPreacherProfileDoc> {
    const updatedPreacher = await Preacher.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedPreacher) {
      throw new Error("Preacher profile not found");
    }

    return updatedPreacher;
  }

  public async uploadSermon(preacherId: ObjectId, sermonData: any): Promise<void> {
    const preacher = await Preacher.findById(preacherId);
    if (!preacher) {
      throw new Error("Preacher not found");
    }

    await Preacher.findByIdAndUpdate(preacherId, {
      $push: { 
        sermons: sermonData._id,
        uploads: sermonData._id,
        uploadHistory: {
          contentId: sermonData._id,
          type: 'sermon',
          timestamp: new Date()
        }
      },
      $inc: { publishedCount: 1 }
    });
  }

  public async createSermonBite(preacherId: ObjectId, biteData: any): Promise<void> {
    const preacher = await Preacher.findById(preacherId);
    if (!preacher) {
      throw new Error("Preacher not found");
    }

    await Preacher.findByIdAndUpdate(preacherId, {
      $push: { 
        bites: biteData._id,
        uploads: biteData._id,
        uploadHistory: {
          contentId: biteData._id,
          type: 'bite',
          timestamp: new Date()
        }
      },
      $inc: { publishedCount: 1 }
    });
  }

  public async manageFeaturedSermons(preacherId: ObjectId, sermonIds: ObjectId[]): Promise<void> {
    const preacher = await Preacher.findById(preacherId);
    if (!preacher) {
      throw new Error("Preacher not found");
    }

    await Preacher.findByIdAndUpdate(preacherId, {
      $set: { featuredSermons: sermonIds }
    });
  }

  public async createPlaylist(preacherId: ObjectId, data: any): Promise<void> {
    const preacher = await Preacher.findById(preacherId);
    if (!preacher) {
      throw new Error("Preacher not found");
    }

    await Preacher.findByIdAndUpdate(preacherId, {
      $push: { playlists: data._id }
    });
  }

  public async manageFeaturedPlaylists(preacherId: ObjectId, playlistIds: ObjectId[]): Promise<void> {
    const preacher = await Preacher.findById(preacherId);
    if (!preacher) {
      throw new Error("Preacher not found");
    }

    await Preacher.findByIdAndUpdate(preacherId, {
      $set: { featuredPlaylists: playlistIds }
    });
  }

  public async updateMonthlyListeners(preacherId: ObjectId): Promise<void> {
    const preacher = await Preacher.findById(preacherId);
    if (!preacher) {
      throw new Error("Preacher not found");
    }

    // Calculate monthly listeners (implementation depends on your tracking system)
    const monthlyListeners = await this.calculateMonthlyListeners(preacherId);

    await Preacher.findByIdAndUpdate(preacherId, {
      $set: { monthlyListeners }
    });
  }

  private async calculateMonthlyListeners(preacherId: ObjectId): Promise<number> {
    // Implementation for calculating monthly listeners
    return 0; // Placeholder
  }

  public async updateEngagementMetrics(preacherId: ObjectId): Promise<void> {
    const preacher = await Preacher.findById(preacherId);
    if (!preacher) {
      throw new Error("Preacher not found");
    }

    // Calculate metrics (implementation depends on your tracking system)
    const likes = await this.calculateTotalLikes(preacherId);
    const shares = await this.calculateTotalShares(preacherId);

    await Preacher.findByIdAndUpdate(preacherId, {
      $set: { likes, shares }
    });
  }

  private async calculateTotalLikes(preacherId: ObjectId): Promise<number> {
    // Implementation for calculating total likes
    return 0; // Placeholder
  }

  private async calculateTotalShares(preacherId: ObjectId): Promise<number> {
    // Implementation for calculating total shares
    return 0; // Placeholder
  }

  public async submitVerification(preacherId: ObjectId, documents: string[]): Promise<void> {
    const preacher = await Preacher.findById(preacherId);
    if (!preacher) {
      throw new Error("Preacher not found");
    }

    await Preacher.findByIdAndUpdate(preacherId, {
      $set: {
        identification: documents,
        verificationStatus: EVerificationStatus.PENDING
      }
    });
  }

  public async updateVerificationStatus(
    preacherId: ObjectId,
    status: EVerificationStatus
  ): Promise<void> {
    const preacher = await Preacher.findById(preacherId);
    if (!preacher) {
      throw new Error("Preacher not found");
    }

    await Preacher.findByIdAndUpdate(preacherId, {
      $set: {
        verificationStatus: status,
        isVerified: status === EVerificationStatus.APPROVED,
        verifiedAt: status === EVerificationStatus.APPROVED ? new Date() : null
      }
    });
  }

  public async getPreacherProfile(userId: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const preacher = await Preacher.findOne({ user: userId })
      .populate("sermons")
      .populate("playlists")
      .populate("followers")
      .populate("bites")
      .populate("featuredSermons")
      .populate("featuredPlaylists");

    if (!preacher) {
      result.error = true;
      result.message = "Preacher profile not found";
      result.code = 404;
      return result;
    }

    result.data = preacher;
    return result;
  }
}

export default new PreacherService();
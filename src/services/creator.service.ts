import { ObjectId } from "mongoose";
import { createCreatorProfileDTO, updateCreatorProfileDTO } from "../dtos/profile.dto";
import Creator from "../models/Creator.model";
import { ICreatorProfileDoc, IResult, IUserDoc } from "../utils/interface.util";
import { EUserType, EVerificationStatus } from "../utils/enums.util";
import { generateRandomChars } from "../utils/helper.util";

class CreatorService {
  public async createCreatorProfile(
    data: createCreatorProfileDTO
  ): Promise<IResult<{ creator: ICreatorProfileDoc; user: IUserDoc }>> {
    const { user,  } = data;
  
    const result: IResult<{ creator: ICreatorProfileDoc; user: IUserDoc }> = {
      error: false,
      message: "",
      code: 200,
      data: null,
    };
  
    const existingCreator = await Creator.findOne({ user: user._id });
    if (existingCreator) {
      result.error = true;
      result.message = "Creator profile already exists for this user";
      result.code = 400;
      return result;
    }
  
    const creatorProfileData = {
      _id: user._id,
      id: user.id,
      creatorID: generateRandomChars(12),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      type: EUserType.CREATOR,
      user: user._id,
      isActive: true,
      isSuspended: false,
      isDeleted: false,
    };
  
    const creator = await Creator.create(creatorProfileData);
  
    user.profiles = {
      ...user.profiles,
      creator: creator._id,
    };
    await user.save();


  
    result.data = { creator, user };
    result.message = "Creator profile created";
    result.code = 201;
    return result;
  }
  

  public async updateCreatorProfile(
    id: ObjectId,
    data: Partial<ICreatorProfileDoc>
  ): Promise<ICreatorProfileDoc> {
    const updatedCreator = await Creator.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedCreator) {
      throw new Error("Creator profile not found");
    }

    return updatedCreator;
  }

  public async createSermonBite(creatorId: ObjectId, biteData: any): Promise<void> {
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    await Creator.findByIdAndUpdate(creatorId, {
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

  public async manageTopBites(creatorId: ObjectId, biteIds: ObjectId[]): Promise<void> {
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    await Creator.findByIdAndUpdate(creatorId, {
      $set: { topBites: biteIds }
    });
  }

  public async updateMonthlyListeners(creatorId: ObjectId): Promise<void> {
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    const monthlyListeners = await this.calculateMonthlyListeners(creatorId);

    await Creator.findByIdAndUpdate(creatorId, {
      $set: { monthlyListeners }
    });
  }

  private async calculateMonthlyListeners(creatorId: ObjectId): Promise<number> {
    // Implementation for calculating monthly listeners
    return 0; // Placeholder
  }

  public async updateEngagementMetrics(creatorId: ObjectId): Promise<void> {
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    const likes = await this.calculateTotalLikes(creatorId);
    const shares = await this.calculateTotalShares(creatorId);

    await Creator.findByIdAndUpdate(creatorId, {
      $set: { likes, shares }
    });
  }

  private async calculateTotalLikes(creatorId: ObjectId): Promise<number> {
    // Implementation for calculating total likes
    return 0; // Placeholder
  }

  private async calculateTotalShares(creatorId: ObjectId): Promise<number> {
    // Implementation for calculating total shares
    return 0; // Placeholder
  }

  public async submitVerification(creatorId: ObjectId, documents: string[]): Promise<void> {
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    await Creator.findByIdAndUpdate(creatorId, {
      $set: {
        identification: documents,
        verificationStatus: EVerificationStatus.PENDING
      }
    });
  }

  public async updateVerificationStatus(
    creatorId: ObjectId,
    status: EVerificationStatus
  ): Promise<void> {
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    await Creator.findByIdAndUpdate(creatorId, {
      $set: {
        verificationStatus: status,
        isVerified: status === EVerificationStatus.APPROVED,
        verifiedAt: status === EVerificationStatus.APPROVED ? new Date() : null
      }
    });
  }

  public async getCreatorProfile(userId: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const creator = await Creator.findOne({ user: userId })
      .populate("bites")
      .populate("topBites")
      .populate("followers")
      .populate("uploads")
      .populate("uploadHistory");

    if (!creator) {
      result.error = true;
      result.message = "Creator profile not found";
      result.code = 404;
      return result;
    }

    result.data = creator;
    return result;
  }
}

export default new CreatorService();
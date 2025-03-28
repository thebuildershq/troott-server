import { Model } from "mongoose";
import CreatorProfile from "../models/Creator.model";
import { IResult, ICreatorProfileDoc } from "../utils/interface.util";
import { EVerificationStatus } from "../utils/enums.util";


class CreatorRepository {
  private model: Model<ICreatorProfileDoc>;

  constructor() {
    this.model = CreatorProfile;
  }

  /**
   * @name findById
   * @param id
   * @returns {Promise<IResult>}
   */
  public async findById(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(id);
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.data = profile;
    }

    return result;
  }

  /**
   * @name findByEmail
   * @param email
   * @returns {Promise<IResult>}
   */
  public async findByEmail(email: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findOne({ email }).lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.data = profile;
    }

    return result;
  }

  /**
   * @name findBySlug
   * @param slug
   * @returns {Promise<IResult>}
   */
  public async findBySlug(slug: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findOne({ slug }).lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.data = profile;
    }

    return result;
  }

  /**
   * @name getCreatorProfiles
   * @returns {Promise<IResult>}
   */
  public async getCreatorProfiles(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({}).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name createCreatorProfile
   * @param profileData
   * @returns {Promise<IResult>}
   */
  public async createCreatorProfile(profileData: Partial<ICreatorProfileDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newProfile = await this.model.create(profileData);
    result.data = newProfile;
    result.message = "Creator profile created successfully";

    return result;
  }

  /**
   * @name updateCreatorProfile
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateCreatorProfile(id: string, updateData: Partial<ICreatorProfileDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.message = "Creator profile updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }

  /**
   * @name deleteCreatorProfile
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteCreatorProfile(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedProfile = await this.model.findByIdAndDelete(id);
    if (!deletedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.message = "Creator profile deleted successfully";
      result.data = deletedProfile;
    }

    return result;
  }

  /**
   * @name getBitesByCreator
   * @param creatorId
   * @returns {Promise<IResult>}
   */
  public async getBitesByCreator(creatorId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(creatorId).populate("bites").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.data = profile.bites;
    }

    return result;
  }

  /**
   * @name getFollowers
   * @param creatorId
   * @returns {Promise<IResult>}
   */
  public async getFollowers(creatorId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(creatorId).populate("followers").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.data = profile.followers;
    }

    return result;
  }

  /**
   * @name getMonthlyListeners
   * @param creatorId
   * @returns {Promise<IResult>}
   */
  public async getMonthlyListeners(creatorId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(creatorId).select("monthlyListeners").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.data = { monthlyListeners: profile.monthlyListeners };
    }

    return result;
  }

  /**
   * @name getTopBites
   * @param creatorId
   * @returns {Promise<IResult>}
   */
  public async getTopBites(creatorId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(creatorId).populate("topBites").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.data = profile.topBites;
    }

    return result;
  }

  /**
   * @name updateVerificationStatus
   * @param id
   * @param status
   * @returns {Promise<IResult>}
   */
  public async updateVerificationStatus(id: string, status: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(
      id,
      { verificationStatus: status, isVerified: status === EVerificationStatus.APPROVED, verifiedAt: new Date() },
      { new: true }
    );

    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Creator profile not found";
    } else {
      result.message = "Verification status updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }
}

export default new CreatorRepository();

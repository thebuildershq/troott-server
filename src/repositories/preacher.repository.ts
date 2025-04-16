import { Model } from "mongoose";
import PreacherProfile from "../models/Preacher.model";
import { IResult, IPreacherProfileDoc } from "../utils/interface.util";

class PreacherProfileRepository {
  private model: Model<IPreacherProfileDoc>;

  constructor() {
    this.model = PreacherProfile;
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
      result.message = "Preacher profile not found";
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
      result.message = "Preacher profile not found";
    } else {
      result.data = profile;
    }

    return result;
  }

  /**
   * @name getPreachers
   * @returns {Promise<IResult>}
   */
  public async getPreachers(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({}).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name createPreacherProfile
   * @param profileData
   * @returns {Promise<IResult>}
   */
  public async createPreacherProfile(profileData: Partial<IPreacherProfileDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newProfile = await this.model.create(profileData);
    result.data = newProfile;
    result.message = "Preacher profile created successfully";

    return result;
  }

  /**
   * @name updatePreacherProfile
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updatePreacherProfile(id: string, updateData: Partial<IPreacherProfileDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Preacher profile not found";
    } else {
      result.message = "Preacher profile updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }

  /**
   * @name deletePreacherProfile
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deletePreacherProfile(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedProfile = await this.model.findByIdAndDelete(id);
    if (!deletedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Preacher profile not found";
    } else {
      result.message = "Preacher profile deleted successfully";
      result.data = deletedProfile;
    }

    return result;
  }

  /**
   * @name getPreachersByMinistry
   * @param ministry
   * @returns {Promise<IResult>}
   */
  public async getPreachersByMinistry(ministry: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({ ministry }).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name getFollowers
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async getFollowers(preacherId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(preacherId).select("followers").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Preacher profile not found";
    } else {
      result.data = profile.followers;
    }

    return result;
  }

  /**
   * @name getSermons
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async getSermons(preacherId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(preacherId).select("sermons").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Preacher profile not found";
    } else {
      result.data = profile.sermons;
    }

    return result;
  }

  /**
   * @name getBites
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async getBites(preacherId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(preacherId).select("bites").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Preacher profile not found";
    } else {
      result.data = profile.bites;
    }

    return result;
  }

  /**
   * @name getPlaylists
   * @param preacherId
   * @returns {Promise<IResult>}
   */
  public async getPlaylists(preacherId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(preacherId).select("playlists").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Preacher profile not found";
    } else {
      result.data = profile.playlists;
    }

    return result;
  }

  /**
   * @name updateVerificationStatus
   * @param preacherId
   * @param status
   * @returns {Promise<IResult>}
   */
  public async updateVerificationStatus(preacherId: string, status: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(
      preacherId,
      { verificationStatus: status, isVerified: status === "verified" },
      { new: true }
    );

    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Preacher profile not found";
    } else {
      result.message = "Verification status updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }
}

export default new PreacherProfileRepository();

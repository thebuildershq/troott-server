import { Model } from "mongoose";
import StaffProfile from "../models/Staff.model";
import { IResult, IStaffProfileDoc } from "../utils/interface.util";

class StaffProfileRepository {
  private model: Model<IStaffProfileDoc>;

  constructor() {
    this.model = StaffProfile;
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
      result.message = "Staff profile not found";
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
      result.message = "Staff profile not found";
    } else {
      result.data = profile;
    }

    return result;
  }

  /**
   * @name getAllStaffProfiles
   * @returns {Promise<IResult>}
   */
  public async getAllStaffProfiles(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({}).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name createStaffProfile
   * @param profileData
   * @returns {Promise<IResult>}
   */
  public async createStaffProfile(profileData: Partial<IStaffProfileDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newProfile = await this.model.create(profileData);
    result.data = newProfile;
    result.message = "Staff profile created successfully";

    return result;
  }

  /**
   * @name updateStaffProfile
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateStaffProfile(id: string, updateData: Partial<IStaffProfileDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Staff profile not found";
    } else {
      result.message = "Staff profile updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }

  /**
   * @name deleteStaffProfile
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteStaffProfile(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedProfile = await this.model.findByIdAndDelete(id);
    if (!deletedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Staff profile not found";
    } else {
      result.message = "Staff profile deleted successfully";
      result.data = deletedProfile;
    }

    return result;
  }

  /**
   * @name getStaffByRole
   * @param role
   * @returns {Promise<IResult>}
   */
  public async getStaffByRole(role: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({ role }).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name getStaffByUnit
   * @param unit
   * @returns {Promise<IResult>}
   */
  public async getStaffByUnit(unit: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({ unit }).lean();
    result.data = profiles;

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
      { verificationStatus: status, isVerified: status === "VERIFIED" },
      { new: true }
    );

    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Staff profile not found";
    } else {
      result.message = "Verification status updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }
}

export default new StaffProfileRepository();

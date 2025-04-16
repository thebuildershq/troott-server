import { Model } from "mongoose";
import ListenerProfile from "../models/Listener.model";
import { IResult, IListenerProfileDoc } from "../utils/interface.util";


class ListenerRepository {
  private model: Model<IListenerProfileDoc>;

  constructor() {
    this.model = ListenerProfile;
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
      result.message = "Listener profile not found";
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
      result.message = "Listener profile not found";
    } else {
      result.data = profile;
    }

    return result;
  }

  /**
   * @name getAllProfiles
   * @returns {Promise<IResult>}
   */
  public async getAllProfiles(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profiles = await this.model.find({}).lean();
    result.data = profiles;

    return result;
  }

  /**
   * @name createProfile
   * @param profileData
   * @returns {Promise<IResult>}
   */
  public async createProfile(profileData: Partial<IListenerProfileDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const newProfile = await this.model.create(profileData);
    result.data = newProfile;
    result.message = "Listener profile created successfully";

    return result;
  }

  /**
   * @name updateProfile
   * @param id
   * @param updateData
   * @returns {Promise<IResult>}
   */
  public async updateProfile(id: string, updateData: Partial<IListenerProfileDoc>): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await this.model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Listener profile not found";
    } else {
      result.message = "Listener profile updated successfully";
      result.data = updatedProfile;
    }

    return result;
  }

  /**
   * @name deleteProfile
   * @param id
   * @returns {Promise<IResult>}
   */
  public async deleteProfile(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const deletedProfile = await this.model.findByIdAndDelete(id);
    if (!deletedProfile) {
      result.error = true;
      result.code = 404;
      result.message = "Listener profile not found";
    } else {
      result.message = "Listener profile deleted successfully";
      result.data = deletedProfile;
    }

    return result;
  }

  /**
   * @name getFollowers
   * @param id
   * @returns {Promise<IResult>}
   */
  public async getFollowers(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(id).populate("followers").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Listener profile not found";
    } else {
      result.data = profile.followers;
    }

    return result;
  }

  /**
   * @name getFollowing
   * @param id
   * @returns {Promise<IResult>}
   */
  public async getFollowing(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(id).populate("following").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Listener profile not found";
    } else {
      result.data = profile.following;
    }

    return result;
  }

  /**
   * @name getListeningHistory
   * @param id
   * @returns {Promise<IResult>}
   */
  public async getListeningHistory(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(id).populate("listeningHistory").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Listener profile not found";
    } else {
      result.data = profile.listeningHistory;
    }

    return result;
  }

  /**
   * @name getLikedSermons
   * @param id
   * @returns {Promise<IResult>}
   */
  public async getLikedSermons(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(id).populate("likedSermons").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Listener profile not found";
    } else {
      result.data = profile.likedSermons;
    }

    return result;
  }

  /**
   * @name getSavedSermonBites
   * @param id
   * @returns {Promise<IResult>}
   */
  public async getSavedSermonBites(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(id).populate("savedSermonBites").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Listener profile not found";
    } else {
      result.data = profile.savedSermonBites;
    }

    return result;
  }

  /**
   * @name getSubscriptions
   * @param id
   * @returns {Promise<IResult>}
   */
  public async getSubscriptions(id: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const profile = await this.model.findById(id).populate("subscriptions").lean();
    if (!profile) {
      result.error = true;
      result.code = 404;
      result.message = "Listener profile not found";
    } else {
      result.data = profile.subscriptions;
    }

    return result;
  }
}

export default new ListenerRepository();

import { Model, ObjectId } from "mongoose";
import { IResult, IUserDoc } from "../utils/interface.util";
import User from "../models/User.model";

class PreferencesRepository {
  private model: Model<IUserDoc>;

  constructor() {
    this.model = User;
  }

  /**
   * @method createPreferences
   * @description Sets initial preferences (topics and preacher IDs) for a given user.
   * @param {Object} input - Input payload
   * @param {string} input.user - The ID of the user to update preferences for
   * @param {{ topics: string[], preacher: ObjectId[] }} input.preferences - The preferences to set
   * @returns {Promise<IResult>} Standard result object with success or error details
   */
  public async createPreferences({
    user,
    preferences,
  }: {
    user: string;
    preferences: { topics: string[]; preacher: ObjectId[] };
  }): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 201, data: {} };

    const userDoc = await this.model.findById(user);
    if (!userDoc) {
      return {
        error: true,
        message: "User not found",
        code: 404,
        data: {},
      };
    }

    userDoc.preferences = preferences;
    await userDoc.save();

    result.message = "Preferences created successfully";
    result.data = userDoc.preferences;
    return result;
  }

  /**
   * @method findByUser
   * @description Fetches the preferences for a given user ID.
   * @param {string} userId - ID of the user whose preferences are being fetched
   * @returns {Promise<IResult>} Standard result object containing user preferences
   */
  public async findByUser(userId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const userDoc = await this.model.findById(userId).select("preferences");
    if (!userDoc) {
      return {
        error: true,
        message: "Preferences not found",
        code: 404,
        data: {},
      };
    }

    result.message = "Preferences found";
    result.data = userDoc.preferences;
    return result;
  }

  /**
   * @method updatePreferences
   * @description Updates one or both fields of user preferences (topics or preachers).
   * @param {string} userId - ID of the user to update preferences for
   * @param {Partial<{ topics: string[]; preacher: ObjectId[] }>} preferences - Preferences to update
   * @returns {Promise<IResult>} Result object with the updated preferences
   */
  public async updatePreferences(
    userId: string,
    preferences: Partial<{ topics: string[]; preacher: ObjectId[] }>
  ): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const userDoc = await this.model.findById(userId);
    if (!userDoc) {
      return {
        error: true,
        message: "User not found",
        code: 404,
        data: {},
      };
    }

    if (preferences.topics) {
      userDoc.preferences.topics = preferences.topics;
    }

    if (preferences.preacher) {
      userDoc.preferences.preacher = preferences.preacher;
    }

    await userDoc.save();

    result.message = "Preferences updated successfully";
    result.data = userDoc.preferences;
    return result;
  }

  /**
   * @name deletePreferences
   */
  public async deletePreferences(userId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const userDoc = await this.model.findById(userId);
    if (!userDoc) {
      return {
        error: true,
        message: "User not found",
        code: 404,
        data: {},
      };
    }

    userDoc.preferences = { topics: [], preacher: [] };
    await userDoc.save();

    result.message = "Preferences cleared";
    result.data = userDoc.preferences;
    return result;
  }

  /**
   * @name findAll
   * @description Fetch preferences for all users
   * @returns {Promise<IResult>}
   */
  public async findAll(): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    const users = await this.model.find({}, { preferences: 1, _id: 1 }).lean();

    if (!users || users.length === 0) {
      result.error = true;
      result.code = 404;
      result.message = "No preferences found";
    } else {
      result.data = users;
      result.message = "Preferences retrieved successfully";
    }

    return result;
  }
}

export const preferencesRepository = new PreferencesRepository();

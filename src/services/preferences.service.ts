import User from "../models/User.model";
import ErrorResponse from "../utils/error.util";
import { IResult } from "../utils/interface.util";

export class PreferenceService {
  /**
   * @name selectFavoritePreachers
   * @description Allows a user to select up to 5 favorite preachers during onboarding.
   * @param userId - The ID of the user
   * @param preacherIds - Array of preacher IDs
   * @returns Promise<IResult>
   */
  static async selectFavoritePreachers(userId: string, preacherIds: string[]): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      if (preacherIds.length > 5) {
        throw new ErrorResponse("Limit exceeded", 400, ["You can only choose up to 5 preachers"]);
      }

      const user = await User.findByIdAndUpdate(userId, { favoritePreachers: preacherIds }, { new: true });

      if (!user) {
        throw new ErrorResponse("User not found", 404, ["Unable to update favorite preachers"]);
      }

      result.message = "Preachers selected successfully";
      result.data = { user };
    } catch (error: any) {
      result.error = true;
      result.code = error.code || 500;
      result.message = error.message;
    }

    return result;
  }

  /**
   * @name updateFavoritePreachers
   * @description Updates a user's selected preachers after onboarding.
   * @param userId - The ID of the user
   * @param preacherIds - Array of preacher IDs
   * @returns Promise<IResult>
   */
  static async updateFavoritePreachers(userId: string, preacherIds: string[]): Promise<IResult> {
    return this.selectFavoritePreachers(userId, preacherIds);
  }

  /**
   * @name getRecommendedPreachers
   * @description Suggests preachers based on similar user preferences.
   * @param userId - The ID of the user
   * @returns Promise<IResult>
   */
  static async getRecommendedPreachers(userId: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const user = await User.findById(userId).populate("favoritePreachers");

      if (!user) {
        throw new ErrorResponse("User not found", 404, ["User does not exist"]);
      }

      const similarUsers = await User.find({
        favoritePreachers: { $in: user.favoritePreachers },
        _id: { $ne: userId }, // Exclude the current user
      });

      const recommendedPreacherIds = new Set();
      for (const u of similarUsers) {
        u.favoritePreachers.forEach((p) => recommendedPreacherIds.add(p.toString()));
      }

      result.data = { recommendedPreachers: Array.from(recommendedPreacherIds) };
      result.message = "Recommended preachers retrieved successfully";
    } catch (error: any) {
      result.error = true;
      result.code = error.code || 500;
      result.message = error.message;
    }

    return result;
  }

  /**
   * @name getPreacherPopularity
   * @description Retrieves the most followed preachers.
   * @returns Promise<IResult>
   */
  static async getPreacherPopularity(): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const preacherCounts = await User.aggregate([
        { $unwind: "$favoritePreachers" },
        { $group: { _id: "$favoritePreachers", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      result.data = { preacherCounts };
      result.message = "Preacher popularity retrieved successfully";
    } catch (error: any) {
      result.error = true;
      result.code = error.code || 500;
      result.message = error.message;
    }

    return result;
  }

  /**
   * @name getUserPreferences
   * @description Fetches a user's selected preachers.
   * @param userId - The ID of the user
   * @returns Promise<IResult>
   */
  static async getUserPreferences(userId: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const user = await User.findById(userId).populate("favoritePreachers");

      if (!user) {
        throw new ErrorResponse("User not found", 404, ["User does not exist"]);
      }

      result.data = { favoritePreachers: user.favoritePreachers };
      result.message = "User preferences retrieved successfully";
    } catch (error: any) {
      result.error = true;
      result.code = error.code || 500;
      result.message = error.message;
    }

    return result;
  }
}

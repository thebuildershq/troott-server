import {
  createListenerProfileDTO,
  updateListenerProfileDTO,
} from "../dtos/profile.dto";
import Listener from "../models/Listener.model";
import User from "../models/User.model";
import { EUserType } from "../utils/enums.util";
import { generateRandomChars } from "../utils/helper.util";
import {
  IListenerProfileDoc,
  IResult,
  IUserDoc,
} from "../utils/interface.util";

class ListenerService {
  constructor() {}

  /**
   * @name createListener
   * @description
   * Creates a new listener profile in the database using the provided DTO.
   * This method handles profile setup for newly registered listeners by saving
   * essential user metadata such as personal details, location, and engagement info.
   * @param {ListenerProfileDTO} data
   * @returns {Promise<{listener: IListenerProfileDoc, user: IUserDoc}t>}
   */
  public async createListener(
    data: createListenerProfileDTO
  ): Promise<IResult<{ listener: IListenerProfileDoc; user: IUserDoc }>> {
    const result: IResult<{ listener: IListenerProfileDoc; user: IUserDoc }> = {
      error: false,
      message: "",
      code: 200,
      data: null,
    };
  
    const { firstName, lastName, email, gender, avatar, user }: createListenerProfileDTO = data;
  
    if (!user) {
      return {
        error: true,
        message: "User information is required to create a listener profile",
        code: 400,
        data: null,
      };
    }
  
    const existingListener = await Listener.findOne({ user: user._id });
    if (existingListener) {
      return {
        error: true,
        message: "Listener profile already exists for this user",
        code: 400,
        data: null,
      };
    }
  
    const listenerProfileData = {
      _id: user._id,
      id: user.id,
      listenerID: generateRandomChars(12),
      firstName: firstName,
      lastName: lastName,
      email: email,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      gender: gender,
      avatar: avatar,
      type: EUserType.LISTENER,
      user: user._id,
      createdBy: user._id,
    };
  
    const listener = await Listener.create(listenerProfileData);
  
    user.profiles = {
      ...user.profiles,
      listener: listener._id,
    };
    await user.save();
  
    return {
      error: false,
      message: "Listener profile created",
      code: 201,
      data: { listener, user },
    };
  }
  

  /**
   * @name updateListenerProfile
   * @description
   * Updates an existing listener profile with new information. This method is
   * typically used after profile creation to associate the listener with a specific
   * program or organization context, often during onboarding or invite flows.
   * @param {string} userId
   * @param {ListenerProfileDTO} data
   * @returns {Promise<IResult>}
   */
  public async updateListenerProfile(
    userId: string,
    data: updateListenerProfileDTO
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await Listener.findOneAndUpdate(
      { user: userId },
      { $set: { ...data } },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      result.error = true;
      result.message = "Listener profile not found";
      result.code = 500;
      return result;
    }
    result.error = false;
    result.message = "Listener Profile updated successfully";
    result.code = 200;
    result.data = updatedProfile;
    return result;
  }

  /**
   * @name getListenerProfile
   * @description
   * Retrieves a listener's complete profile including their playlists, listening history,
   * and following list. This method performs a populated query to fetch related data
   * for a comprehensive view of the listener's activity and preferences.
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<IResult>} Result object containing the listener profile or error details
   */
  public async getListenerProfile(userId: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const existingListener = await Listener.findOne({ user: userId })
      .populate("playlists")
      .populate("listeningHistory")
      .populate("following");

    if (!existingListener) {
      result.error = true;
      result.message = "Listener profile not found";
      result.code = 404;
      return result;
    }

    result.data = existingListener;
    return result;
  }

  /**
   * @name addToListeningHistory
   * @description
   * Adds a sermon to the listener's history in chronological order. This method
   * maintains a record of all sermons the listener has engaged with, placing the
   * most recent at the beginning of the history array.
   * @param {string} userId - The unique identifier of the user
   * @param {string} sermonId - The unique identifier of the sermon
   * @returns {Promise<IResult>} Result object containing the updated listener profile
   */
  public async addToListeningHistory(
    userId: string,
    sermonId: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const existingListener = await Listener.findOne({ user: userId });
    if (!existingListener) {
      result.error = true;
      result.message = "Listener profile not found";
      result.code = 404;
      return result;
    }

    const updatedListener = await Listener.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          listeningHistory: {
            $each: [sermonId],
            $position: 0,
          },
        },
      },
      { new: true }
    );

    result.data = updatedListener;
    result.message = "Listening history updated";
    return result;
  }

  /**
   * @name toggleLikeSermon
   * @description
   * Toggles the like status of a sermon for the listener. If the sermon is already
   * liked, it will be unliked, and vice versa. This method manages the user's
   * sermon preferences and engagement tracking.
   * @param {string} userId - The unique identifier of the user
   * @param {string} sermonId - The unique identifier of the sermon
   * @returns {Promise<IResult>} Result object containing the updated like status
   */
  public async toggleLikeSermon(
    userId: string,
    sermonId: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const existingListener = await Listener.findOne({ user: userId });
    if (!existingListener) {
      result.error = true;
      result.message = "Listener profile not found";
      result.code = 404;
      return result;
    }

    const hasLiked = existingListener.likedSermons.includes(sermonId);

    const updatedListener = await Listener.findOneAndUpdate(
      { user: userId },
      hasLiked
        ? { $pull: { likedSermons: sermonId } }
        : { $addToSet: { likedSermons: sermonId } },
      { new: true }
    );

    result.data = updatedListener;
    result.message = hasLiked ? "Sermon unliked" : "Sermon liked";
    return result;
  }

  /**
   * @name toggleFollow
   * @description
   * Manages the follow/unfollow relationship between a listener and a preacher/creator.
   * This method updates both the listener's following list and potentially triggers
   * updates to the target's followers count.
   * @param {string} userId - The unique identifier of the follower
   * @param {string} targetId - The unique identifier of the user to follow/unfollow
   * @returns {Promise<IResult>} Result object containing the updated follow status
   */
  public async toggleFollow(
    userId: string,
    targetId: string
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const existingListener = await Listener.findOne({ user: userId });
    if (!existingListener) {
      result.error = true;
      result.message = "Listener profile not found";
      result.code = 404;
      return result;
    }

    const isFollowing = existingListener.following.includes(targetId);

    const updatedListener = await Listener.findOneAndUpdate(
      { user: userId },
      isFollowing
        ? { $pull: { following: targetId } }
        : { $addToSet: { following: targetId } },
      { new: true }
    );

    result.data = updatedListener;
    result.message = isFollowing
      ? "Unfollowed successfully"
      : "Followed successfully";
    return result;
  }

  /**
   * @name updateInterests
   * @description
   * Updates the listener's interest preferences. This method completely replaces
   * the existing interests array with the new set of interests, allowing for
   * complete interest profile updates.
   * @param {string} userId - The unique identifier of the user
   * @param {string[]} interests - Array of interest identifiers or names
   * @returns {Promise<IResult>} Result object containing the updated interests
   */
  public async updateInterests(
    userId: string,
    interests: string[]
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedListener = await Listener.findOneAndUpdate(
      { user: userId },
      { $set: { interests } },
      { new: true }
    );

    if (!updatedListener) {
      result.error = true;
      result.message = "Listener profile not found";
      result.code = 404;
      return result;
    }

    result.data = updatedListener;
    result.message = "Interests updated successfully";
    return result;
  }

  /**
   * @name getEngagementStats
   * @description
   * Calculates and returns comprehensive engagement statistics for a listener.
   * This includes metrics such as total sermons listened to, likes given,
   * content shared, and social engagement numbers.
   * @param {string} userId - The unique identifier of the user
   * @returns {Promise<IResult>} Result object containing the engagement statistics
   */
  public async getEngagementStats(userId: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const listener = await Listener.findOne({ user: userId });
    if (!listener) {
      result.error = true;
      result.message = "Listener profile not found";
      result.code = 404;
      return result;
    }

    result.data = {
      totalSermons: listener.listeningHistory.length,
      likedSermons: listener.likedSermons.length,
      sharedSermons: listener.sharedSermons.length,
      following: listener.following.length,
      followers: listener.followers.length,
      playlists: listener.playlists.length,
      sermonBites: {
        viewed: listener.viewedSermonBites.length,
        shared: listener.sharedSermonBites.length,
        saved: listener.savedSermonBites.length,
      },
    };

    return result;
  }
}

export default new ListenerService();

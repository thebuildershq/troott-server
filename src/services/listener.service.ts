import {
  createListenerProfileDTO,
  updateListenerProfileDTO,
} from "../dtos/profile.dto";
import Listener from "../models/Listener.model";
import { IResult } from "../utils/interface.util";

class ListenerService {
  constructor() {}

  /**
   * @name createListenerProfile
   * @description
   * Creates a new listener profile in the database using the provided DTO.
   * This method handles profile setup for newly registered listeners by saving
   * essential user metadata such as personal details, location, and engagement info.
   * @param {ListenerProfileDTO} data
   * @returns {Promise<IResult>}
   */
  public async createListenerProfile(
    data: createListenerProfileDTO
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const listenerProfileData = {
      user: data.user,
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      location: data.location,
      phoneNumber: data.phoneNumber,
      phoneCode: data.phoneCode,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      country: data.country,
      avatar: data.avatar,
      slug: data.slug,
      type: data.type,
      card: data.card,
    };

    const profile = await Listener.create(listenerProfileData);

    if (!profile) {
      result.error = true;
      result.message = "Error creating profile";
      result.code = 500;
      return result;
    }
    result.error = false;
    result.message = "Profile created successfully";
    result.data = profile;
    result.code = 200;
    return result;
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
}

export default new ListenerService();

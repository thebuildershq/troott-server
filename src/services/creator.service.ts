import { createCreatorProfileDTO, updateCreatorProfileDTO } from "../dtos/profile.dto";
import Creator from "../models/Creator.model";
import { IResult } from "../utils/interface.util";

class CreatorService {
  constructor() {}

  /**
   * @name createCreatorProfile
   * @description
   * Creates a new Creator profile in the database using the provided DTO.
   * This method handles profile setup for newly registered Creators by saving
   * essential user metadata such as personal details, location, and engagement info.
   * @param {CreatorProfileDTO} data
   * @returns {Promise<IResult>}
   */
  public async createCreatorProfile(
    data: createCreatorProfileDTO
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const creatorProfileData = {
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
    };

    const profile = await Creator.create(creatorProfileData);

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
   * @name updateCreatorProfile
   * @description
   * Updates an existing Creator profile with new information. This method is
   * typically used after profile creation to associate the Creator with a specific
   * program or organization context, often during onboarding or invite flows.
   * @param {string} userId
   * @param {CreatorProfileDTO} data
   * @returns {Promise<IResult>}
   */
  public async updateCreatorProfile(
    userId: string,
    data: updateCreatorProfileDTO
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const updatedProfile = await Creator.findOneAndUpdate(
      { user: userId },
      { $set: { ...data } },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      result.error = true;
      result.message = "Creator profile not found";
      result.code = 500;
      return result;
    }
    result.error = false;
    result.message = "Creator Profile updated successfully";
    result.code = 200;
    result.data = updatedProfile;
    return result;
  }
}

export default new CreatorService();

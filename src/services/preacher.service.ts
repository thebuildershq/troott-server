import { createPreacherProfileDTO, updatePreacherProfileDTO } from "../dtos/profile.dto";
  import Preacher from "../models/Preacher.model";
  import { IResult } from "../utils/interface.util";
  
  class PreacherService {
    constructor() {}
  
    /**
     * @name createListenerProfile
     * @description
     * Creates a new Preacher profile in the database using the provided DTO.
     * This method handles profile setup for newly registered Preachers by saving
     * essential user metadata such as personal details, location, and engagement info.
     * @param {PreacherProfileDTO} data
     * @returns {Promise<IResult>}
     */
    public async createPreacherProfile(
      data: createPreacherProfileDTO
    ): Promise<IResult> {
      const result: IResult = { error: false, message: "", code: 200, data: {} };
  
      const preacherProfileData = {
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
  
      const profile = await Preacher.create(preacherProfileData);
  
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
     * @name updatePreacherProfile
     * @description
     * Updates an existing Preacher profile with new information. This method is
     * typically used after profile creation to associate the Preacher with a specific
     * program or organization context, often during onboarding or invite flows.
     * @param {string} userId
     * @param {PreacherProfileDTO} data
     * @returns {Promise<IResult>}
     */
    public async updatePreacherProfile(
      userId: string,
      data: updatePreacherProfileDTO
    ): Promise<IResult> {
      const result: IResult = { error: false, message: "", code: 200, data: {} };
  
      const updatedProfile = await Preacher.findOneAndUpdate(
        { user: userId },
        { $set: { ...data } },
        { new: true, runValidators: true }
      );
  
      if (!updatedProfile) {
        result.error = true;
        result.message = "Preacher profile not found";
        result.code = 500;
        return result;
      }
      result.error = false;
      result.message = "Preacher Profile updated successfully";
      result.code = 200;
      result.data = updatedProfile;
      return result;
    }
  }
  
  export default new PreacherService();
  
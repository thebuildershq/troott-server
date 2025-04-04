import {
    createStaffProfileDTO,
    updateStaffProfileDTO, 
  } from "../dtos/profile.dto";
  import Staff from "../models/Staff.model";
  import { IResult } from "../utils/interface.util";
  
  class StaffService {
    constructor() {}
  
    /**
     * @name createStaffProfile
     * @description
     * Creates a new Staff profile in the database using the provided DTO.
     * This method handles profile setup for newly registered Staffs by saving
     * essential user metadata such as personal details, location, and engagement info.
     * @param {StaffProfileDTO} data
     * @returns {Promise<IResult>}
     */
    public async createStaffProfile(
      data: createStaffProfileDTO
    ): Promise<IResult> {
      const result: IResult = { error: false, message: "", code: 200, data: {} };
  
      const staffProfileData = {
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
  
      const profile = await Staff.create(staffProfileData);
  
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
     * @name updateStaffProfile
     * @description
     * Updates an existing Staff profile with new information. This method is
     * typically used after profile creation to associate the Staff with a specific
     * program or organization context, often during onboarding or invite flows.
     * @param {string} userId
     * @param {StaffProfileDTO} data
     * @returns {Promise<IResult>}
     */
    public async updateStaffProfile(
      userId: string,
      data: updateStaffProfileDTO
    ): Promise<IResult> {
      const result: IResult = { error: false, message: "", code: 200, data: {} };
  
      const updatedProfile = await Staff.findOneAndUpdate(
        { user: userId },
        { $set: { ...data } },
        { new: true, runValidators: true }
      );
  
      if (!updatedProfile) {
        result.error = true;
        result.message = "Staff profile not found";
        result.code = 500;
        return result;
      }
      result.error = false;
      result.message = "Staff Profile updated successfully";
      result.code = 200;
      result.data = updatedProfile;
      return result;
    }
  }
  
  export default new StaffService();
  
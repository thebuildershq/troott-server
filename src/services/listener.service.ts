import {
  createListenerProfileDTO,
  updateListenerProfileDTO,
} from "../dtos/profile.dto";
import Listener from "../models/Listener.model";
import User from "../models/User.model";
import { generateRandomChars } from "../utils/helper.util";
import { IListenerProfileDoc, IResult, IUserDoc } from "../utils/interface.util";

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
  ): Promise<{listener: IListenerProfileDoc, user: IUserDoc}> {
    
    const { firstName, lastName, email, password, type, user, createdBy } = data
    const listenerID = generateRandomChars(12)

    if (user) {

      let listenerProfileData = {
      
        id: user.id,
        _id: user._id,
        listenerID: listenerID
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        location: user.location,
        phoneNumber: user.phoneNumber,
        phoneCode: user.phoneCode,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        country: user.country,
        avatar: user.avatar,
        slug: user.slug,
        type: user.type,
        card: user.card,
      };

      
  
      const profile = await Listener.create(listenerProfileData);

      user.listener = profil`e.listener._id

      await User.save()
  

    }

 
  //   if (!profile) {
  //     result.error = true;
  //     result.message = "Error creating profile";
  //     result.code = 500;
  //     return result;
  //   }
  //   result.error = false;
  //   result.message = "Profile created successfully";
  //   result.data = profile;
  //   result.code = 200;
  //   return result;
  // }

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

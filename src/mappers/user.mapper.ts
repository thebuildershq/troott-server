import { UserDTO, UserProfileDTO } from "../dtos/user.dto";
import { IUserDoc } from "../utils/interface.util";

class UserMapper {
  constructor() {}

  /**
   * @name mapUser
   * @param user
   * @returns UserDTO
   */
  public async mapUser(user: IUserDoc): Promise<UserDTO> {
    const result: UserDTO = {
      id: user.id.toString(),

      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,

      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      country: user.country,

      avatar: user.avatar,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,

      userType: user.userType,
      isSuper: user.isSuper,
      isStaff: user.isStaff,
      isPreacher: user.isPreacher,
      isCreator: user.isCreator,
      isListener: user.isListener,
      isActive: user.isActive,
      isLocked: user.isLocked,
      lockedUntil: user.lockedUntil || null,

      notificationPreferences: {
        email: user.notificationPreferences.email,
        push: user.notificationPreferences.push,
        sms: user.notificationPreferences.sms,
      },

      roles: user.roles.map((role) => role.toString()), // Convert ObjectId to string
      profiles: {
        listener: user.profiles.listener?.toString(),
        creator: user.profiles.creator?.toString(),
        preacher: user.profiles.preacher?.toString(),
        staff: user.profiles.staff?.toString(),
      },

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return result;
  }

  
  /**
   * @name mapUserProfile
   * @param user
   * @returns UserDTO
   */
  public async mapUserProfile(user: IUserDoc): Promise<UserProfileDTO> {
    const result: UserProfileDTO = {
      id: user.id.toString(),

      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,

      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      country: user.country,

      avatar: user.avatar,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,

      userType: user.userType,
      isActive: user.isActive,
      roles: user.roles.map((role) => role.toString()),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return result;
  }
}

export default new UserMapper();

import { MapRegisteredUserDTO } from "../dtos/auth.dto";
import { IUserDoc } from "../utils/interface.util";

class AuthMapper {
  constructor() {}

  /**
   * @name mapRegisteredUser
   * @param user - IUserDoc
   * @returns result
   */
  public async mapRegisteredUser(
    user: IUserDoc
  ): Promise<MapRegisteredUserDTO> {
    const result: MapRegisteredUserDTO = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,

      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      avatar: user.avatar,
      userType: user.userType,
      passwordType: user.passwordType,

      isSuper: user.isSuper,
      isStaff: user.isStaff,
      isPreacher: user.isPreacher,
      isCreator: user.isCreator,
      isListener: user.isListener,

      isActive: user.isActive,
      isLocked: user.isLocked,
      lockedUntil: user.lockedUntil,

      roles: user.roles,
      profiles: user.profiles,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return result;
  }
}

export default new AuthMapper();

import { MapRegisteredUserDTO } from "../dtos/auth.dto";
import { IUserDoc } from "../utils/interface.util";

class AuthMapper {
  constructor() {}

  /**
   * @name mapRegisteredUser
   * @param user
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
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      profileImage: user.profileImage,
      device: user.device,

      passwordType: user.passwordType,
      userType: user.userType,
      isActivated: user.isActivated,
      isSuper: user.isSuper,
      isAdmin: user.isAdmin,
      isCreator: user.isCreator,
      isUser: user.isUser,

      isActive: user.isActive,
      lastLogin: user.lastLogin,  
      role: user.role,
    };

    return result;
  }
}

export default new AuthMapper();

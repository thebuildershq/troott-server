import { CreateUserDTO, EditUserDTO } from "../dtos/user.dto";
import Role from "../models/Role.model";
import User from "../models/User.model";
import { UserType } from "../utils/enums.util";
import ErrorResponse from "../utils/error.util";
import { IUserDoc } from "../utils/interface.util";

class UserService {
  constructor() {}

  /**
   * @name checkEmail
   * @param email
   * @description  Check if email is correct format
   * @returns {boolean}
   */
  public checkEmail(email: string): boolean {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  /**
   * @name checkPassword
   * @param password
   * @description checks password structure
   * @returns {boolean}
   */
  public checkPassword(password: string): boolean {
    const passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * @name createUser
   * @param data
   * @return
   */
  public async createUser(data: CreateUserDTO): Promise<IUserDoc> {
    const {
      firstName,
      lastName,
      password,
      email,
      dateOfBirth,
      gender,
      phoneCode,
      phoneNumber,
      role,
      userType,
      profileImage,
      device,
      isActivated,
      isSuper,
      isAdmin,
      isUser,
      isCreator,
      isActive,
      loginLimit,
      isLocked,
      lockedUntil,
      lastLogin,
    } = data;

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
      phoneCode,
      phoneNumber,
      userType,
      profileImage,
      device,
      isActivated: isActivated ?? false,
      isSuper: isSuper ?? false,
      isAdmin: isAdmin ?? false,
      isUser: isUser ?? true,
      isCreator: isCreator ?? false,
      isActive: isActive ?? true,
      loginLimit: loginLimit ?? 0,
      isLocked: isLocked ?? false,
      lockedUntil,
      lastLogin,
    });

    await this.attachRole(user, role);

    return user;
  }


    /**
   * @name updateUser
   * @param id
   * @param data
   * @returns {Promise<IUserDoc | null>}
   */
    public async updateUser(id: string, data: EditUserDTO): Promise<IUserDoc> {
      const user = await User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        throw new ErrorResponse(`Error`, 404, [`User not found with id of ${id}`]);
      }
      return user;
    }
  

  /**
   * @name attachRole
   * @param user
   * @param role
   */
  public async attachRole(user: IUserDoc, role: string): Promise<void> {
    const userRole = await Role.findOne({ name: role });

    if (userRole) {
      user.role = userRole._id;
      userRole.user = [...userRole.user, user._id];
      await user.save();
      await userRole.save();
    } else {
      throw new ErrorResponse(`Role ${role} does not exist.`, 400, []);
    }
  }

  
  /**
   * @name checkUserRole
   * @description Checks if the user has the specified role
   * @param user - User document
   * @param role - Role to check
   * @returns {boolean}
   */
  public async checkUserRole(user: IUserDoc, role: UserType): Promise<boolean> {
    const populatedUser = await user.populate('role');
    return populatedUser.role.name === role;
  }

}

export default new UserService();
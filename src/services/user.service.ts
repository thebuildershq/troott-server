
import { CreateUserDTO } from "../dtos/user.dto";
import Role from "../models/Role.model";
import User from "../models/User.model";
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
      email,
      firstName,
      password,
      lastName,
      phoneCode,
      phoneNumber,
      username,
      avatar,
      role,
    } = data;

    const user = await User.create({
      email: email,
      password: password,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      username: username ?? "",
      avatar: avatar ?? "",
      phoneNumber: phoneNumber ?? "",
      phoneCode: phoneCode ?? "+234",
    });

    
    await this.attachRole(user, role);

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
      userRole.users = [...userRole.users, user._id];
      await user.save();
      await userRole.save;
    }

    new ErrorResponse(`Role ${role} does not exist.`, 400, []);
  }
}

export default new UserService();

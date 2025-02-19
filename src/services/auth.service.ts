import { RegisterDTO } from "../dtos/auth.dto";
import authMappers from "../mappers/auth.mapper";
import User from "../models/User.model";
import { IResult } from "../utils/interface.util";
import userService from "./user.service";

const user = new User();
class AuthService {
  constructor() {}

  /**
   * @name validateRegister
   * @param data
   * @returns { IResult } - see IResult
   */
  public async validateRegister(data: RegisterDTO): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };
    const { email, password, firstName, lastName } = data;
    this.validateEmailAndPassword(email, password, firstName, lastName, result);

    return result;
  }

  /**
   * @name validateLogin
   * @param data
   * @returns { IResult } - see IResult
   */
  public async validateLogin(data: RegisterDTO): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };
    const { email, password } = data;

    const user = await User.findOne({ email }).populate([
      { path: "role", select: "name permissions" },
     ]);


    if (!user) {
      console.log("No User:", email)
      return this.handleInvalidCredentials(result);

    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return this.handleInvalidCredentials(result);
    }
    const authToken = await user.getAuthToken();
    const mappedData = await authMappers.mapRegisteredUser(user);
    
    result.data = { ...mappedData, token: authToken };
    return result;
  }

  /**
   * @name validateEmailAndPassword
   * @param email
   * @param password
   * @param result
   * @returns result
   */
  private validateEmailAndPassword(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    result: IResult
  ) {
    if (!email) {
      result.error = true;
      result.message = "email is required";
      result.code = 400;
    } else if (!password) {
      result.error = true;
      result.message = "password is required";
      result.code = 400;
    }     else if (!userService.checkEmail(email)) {
      result.error = true;
      result.message = "invalid email supplied";
      result.code = 400;
    } else if (!userService.checkPassword(password)) {
      result.error = true;
      result.message =
        "password must contain, 1 uppercase letter, one special character, one number and must be greater than 8 characters";
      result.code = 400;
    } else if (!firstName || !firstName?.trim()) {
      result.error = true;
      result.message = "First name is a required field";
      result.code = 400;
    } else if (!lastName || !lastName?.trim()) {
      result.error = true;
      result.message = "Last name is a required field";
      result.code = 400;
    } 
  
    else {
      result.error = false;
      result.message = "";
      result.code = 200;
    }

    return console.log(result)
  }
  
  private handleInvalidCredentials(result: IResult) {
    result.error = true;
    result.message = "Invalid Credentials";
    result.code = 401;

    return result;
  }

}

export default new AuthService();

    

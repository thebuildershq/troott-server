import jwt from "jsonwebtoken";
import { IUserDoc, IResult } from "../utils/interface.util";
import ErrorResponse from "../utils/error.util";
import User from "../models/User.model";


class TokenService {
  private secret: string;
  private expire: string;

  constructor() {
    this.secret = process.env.JWT_SECRET as string;
    this.expire = process.env.JWT_EXPIRY as string;

    if (!this.secret) {
      throw new ErrorResponse("Error", 500, ["JWT secrets are not defined."]);
    }
    if (!this.expire) {
      throw new ErrorResponse("Error", 500, ["JWT_EXPIRY is not defined."]);
    }
  }

  public async attachToken(user: IUserDoc): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        this.secret,
        { algorithm: "HS512", expiresIn: this.expire }
      );

      // Store refresh token in the DB
      await User.findByIdAndUpdate(user.id);

      result.data = { token };
      result.message = "Token generated successfully";
    } catch (error) {
      result.error = true;
      result.code = 500;
      result.message = `Failed to generate token: ${result.message}`;
    }

    return result;
  }

  public async refreshToken(accessToken: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const decoded = jwt.verify(this.secret, this.expire) as IUserDoc;
        
      // Verify if refresh token is still valid in the DB
      const user = await User.findById(decoded._id);
      if (!user || user.accessToken !== accessToken) {
        throw new ErrorResponse("Unauthorized", 401, ["Invalid refresh token"]);
      }

      const newToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        this.secret,
        { algorithm: "HS512", expiresIn: this.expire }
      );

      result.data = { token: newToken };
      result.message = "Token refreshed successfully";
    } catch (error) {
      result.error = true;
      result.code = 401;
      result.message = `Failed to refresh token: ${result.message}`;
    }

    return result;
  }
}

export default new TokenService();

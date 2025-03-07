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

      await User.findByIdAndUpdate(user.id, { accessToken: token });

      result.data = { token };
      result.message = "Token generated successfully";
    } catch (error: any) {
      result.error = true;
      result.code = 500;
      result.message = `Failed to generate token: ${error.message}`;
    }

    return result;
  }

  public async refreshToken(accessToken: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const decoded = jwt.verify(accessToken, this.secret) as jwt.JwtPayload;

      const user = await User.findById(decoded.id);
      if (!user || user.accessToken !== accessToken) {
        throw new ErrorResponse("Unauthorized", 401, [
          "Please provide a token",
        ]);
      }

      if (!this.checkTokenValidity(accessToken)) {
       
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
      } else {
        result.data = { token: accessToken };
        result.message = "Token is still valid, no refresh needed";
      }
    } catch (error: any) {
      result.error = true;
      result.code = 401;
      result.message = `Failed to refresh token: ${error.message}`;
    }

    return result;
  }

  private checkTokenValidity(token: string): boolean {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded || !decoded.exp) return false;

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeLeft = expirationTime - currentTime;

    return timeLeft <= 5 * 60 * 60 * 1000;
  }
}

export default new TokenService();

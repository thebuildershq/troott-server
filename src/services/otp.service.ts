import { IUserDoc, IResult } from "../utils/interface.util";
import ErrorResponse from "../utils/error.util";
import User from "../models/User.model";

class OTPService {
  /**
   * @name verifyResetCode
   * @description Verifies the reset code entered by the user.
   * @param email - The user's email address
   * @param resetCode - The reset code provided by the user
   * @returns {Promise<IResult>} Result of the verification process
   */
  public async verifyResetCode(email: string, resetCode: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      const user: IUserDoc | null = await User.findOne({ email });

      if (!user || !user.resetOTP) {
        throw new ErrorResponse("Invalid or expired reset code", 400, []);
      }

      // Check if OTP matches
      if (user.resetOTP !== resetCode) {
        throw new ErrorResponse("Incorrect reset code", 400, []);
      }

      // Check if OTP has expired
      if (Date.now() > user.resetOTPExpirationDate.getTime()) {
        throw new ErrorResponse("Reset code has expired", 400, []);
      }

      result.message = "Reset code verified successfully";
    } catch (error: any) {
      result.error = true;
      result.code = error.code || 500;
      result.message = error.message;
    }

    return result;
  }
}

export default new OTPService();

import { Router } from "express";
import {
  activateUserAccount,
  changePassword,
  forgotPassword,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  resendOTP,
  resetPassword,
  verifyOTP,
} from "../../../controllers/auth.controller";

const authRouter = Router({ mergeParams: true });

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.put("/verify-otp", verifyOTP);
authRouter.put("/resend-otp", resendOTP);
authRouter.put("/activate", activateUserAccount);
authRouter.put("/forgot-password", forgotPassword);
authRouter.put("/reset-password", resetPassword);
authRouter.put("/change-password", changePassword);
authRouter.put("/token", refreshToken);
authRouter.post("/logout", logoutUser);

export default authRouter;

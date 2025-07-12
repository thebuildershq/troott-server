import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/error.util";
import asyncHandler from "./async.mdw";
import User from "../models/User.model";
import tokenService from "../services/token.service";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * @description Middleware to verify user has required permissions
 * @param {Request} req - Express request object containing authenticated user
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 * @throws {ErrorResponse}
 *  - 404 if user role not found
 *  - 403 if user lacks required permissions
 */
const Protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const token = req.header("authorization")?.split(" ")[1];
    if (!token) {
      return next(new ErrorResponse("No token provided", 401, [""]));
    }

     let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return next(new ErrorResponse("Token has expired", 403, [""]));
      }
      return next(new ErrorResponse("Invalid token", 401, [""]));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse("Invalid or expired token", 401, []));
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      return next(new ErrorResponse("Token revoked", 401, []));
    }

    // Check if token needs refresh
    if (!tokenService.checkTokenValidity(token)) {
      const refreshResult = await tokenService.refreshToken(token);
      if (refreshResult.error) {
        return next(
          new ErrorResponse(refreshResult.message, refreshResult.code, [])
        );
      }
      // Set new token in response header
      res.setHeader("X-New-Token", refreshResult.data.token);
    }
    
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();

  }
);

export default Protect;

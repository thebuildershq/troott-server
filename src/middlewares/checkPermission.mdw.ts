import { Request, Response, NextFunction } from "express";
import Role from "../models/Role.model";
import ErrorResponse from "../utils/error.util";
import asyncHandler from "./async.mdw";

/**
 * @description Creates a middleware to check user permissions against required route permissions
 * @param {Array<string>} requiredPermissions - Array of permission strings required for the route
 * @returns {Function} Express middleware function
 */
const checkPermissions = (requiredPermissions: Array<string>) => {

  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ErrorResponse("User not authenticated.", 401, []));
    }

    if (user.isSuperAdmin === true) {
      return next();
    }

    const userRole = await Role.findById(user?.role);
    if (!userRole) {
      return next(new ErrorResponse("Role not found.", 404, []));
    }

    const hasPermission = requiredPermissions.every((perm) =>
      userRole.permissions.includes(perm)
    );
    if (!hasPermission) {
      return next(
        new ErrorResponse("Access Denied: Insufficient permissions.", 403, [])
      );
    }
    next();
  });
};

export default checkPermissions;

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
      return next(new ErrorResponse("Unauthorized", 401, ["User not authenticated."]));
    }

    if (user.isSuperAdmin === true) {
      return next();
    }

    const userRole = await Role.findById(user?.role);
    if (!userRole) {
      return next(new ErrorResponse("Error", 404, ["Role not found."]));
    }

    const hasPermission = requiredPermissions.every((perm) =>
      userRole.permissions.includes(perm)
    );
    if (!hasPermission) {
      return next(
        new ErrorResponse("Error", 403, ["Access Denied: Insufficient permissions."])
      );
    }
    next();
  });
};

export default checkPermissions;

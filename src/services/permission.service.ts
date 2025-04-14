import { Types } from "mongoose";
import { IResult, IUserDoc } from "../utils/interface.util";
import Role from "../models/Role.model";
import { EUserType } from "../utils/enums.util";
import { IPermissionDTO } from "../dtos/system.dto";

class PermissionService {
  /**
   * @name initiatePermissionData
   * @description initiates default permissions for a new user based on their role
   * @param user User object containing role information
   * @returns Updated user object with permissions
   */
  static async initiatePermissionData(user: IUserDoc): Promise<any> {
    let rolePermissions: string[] = [];

    if (user.userType === EUserType.SUPERADMIN) {
      rolePermissions = [
        // System Management
        "system:read",
        "system:update",
        "system:configure",
        "system:restart",

        // User Management
        "user:create",
        "user:read",
        "user:update",
        "user:delete",
        "user:disable",

        // Role & Permission Management
        "role:create",
        "role:read",
        "role:update",
        "role:delete",
        "role:disable",
        "permission:create",
        "permission:read",
        "permission:update",
        "permission:delete",
        "permission:disable",

        // Content Management
        "sermon:create",
        "sermon:read",
        "sermon:update",
        "sermon:delete",
        "sermon:destroy",
        "sermonbite:create",
        "sermonbite:read",
        "sermonbite:update",
        "sermonbite:delete",
        "sermonbite:destroy",
        "playlist:create",
        "playlist:read",
        "playlist:update",
        "playlist:delete",
        "playlist:destroy",
        "playlist:disable",

        // Subscription & Transaction Management
        "subscription:create",
        "subscription:read",
        "subscription:update",
        "subscription:cancel",
        "transaction:create",
        "transaction:read",
        "transaction:update",
        "transaction:refund",
        "plan:create",
        "plan:read",
        "plan:update",
        "plan:delete",

        // API Management
        "apikey:create",
        "apikey:read",
        "apikey:update",
        "apikey:disable",
        "apikey:delete",

        // Analytics & Revenue
        "analytics:read",
        "analytics:update",
        "analytics:export",
        "revenue:read",
        "revenue:update",

        // Advertisement Management
        "ads:create",
        "ads:read",
        "ads:update",
        "ads:delete",
      ];
    } else if (user.userType === EUserType.STAFF) {
      rolePermissions = [
        // User Management
        "user:create",
        "user:read",
        "user:update",
        "user:delete",
        "user:disable",

        // Role & Permission Management
        "role:create",
        "role:read",
        "role:update",
        "role:delete",
        "role:disable",
        "permission:create",
        "permission:read",
        "permission:update",
        "permission:delete",
        "permission:disable",

        // Content Management
        "sermon:create",
        "sermon:read",
        "sermon:update",
        "sermon:delete",
        "sermon:destroy",
        "sermonbite:create",
        "sermonbite:read",
        "sermonbite:update",
        "sermonbite:delete",
        "sermonbite:destroy",
        "playlist:create",
        "playlist:read",
        "playlist:update",
        "playlist:delete",
        "playlist:destroy",
        "playlist:disable",

        // Subscription & Transaction Management
        "subscription:create",
        "subscription:read",
        "subscription:update",
        "subscription:cancel",
        "transaction:create",
        "transaction:read",
        "transaction:update",
        "transaction:refund",
        "plan:create",
        "plan:read",
        "plan:update",
        "plan:delete",

        // API Management
        "apikey:create",
        "apikey:read",
        "apikey:update",
        "apikey:disable",
        "apikey:delete",

        // Analytics & Revenue
        "analytics:read",
        "analytics:update",
        "analytics:export",
        "revenue:read",
        "revenue:update",

        // Advertisement Management
        "ads:create",
        "ads:read",
        "ads:update",
        "ads:delete",
      ];
    } else if (user.userType === EUserType.PREACHER) {
      rolePermissions = [
        // Content Management
        "sermon:create",
        "sermon:read",
        "sermon:update",
        "sermon:delete",
        "sermon:destroy",

        // Sermonbite Management
        "sermonbite:create",
        "sermonbite:read",
        "sermonbite:update",
        "sermonbite:delete",
        "sermonbite:destroy",

        // Playlist Management
        "playlist:create",
        "playlist:read",
        "playlist:update",
        "playlist:delete",
        "playlist:destroy",
        "playlist:disable",

        // Analytics & Profile
        "analytics:read",
        "analytics:export",
        "user:read",
        "user:update",

        // Basic Access
        "sermon:read",
      ];
    } else if (user.userType === EUserType.CREATOR) {
      rolePermissions = [
        // Content Management
        "sermonbite:create",
        "sermonbite:read",
        "sermonbite:update",
        "sermonbite:delete",

        // Playlist Management
        "playlist:create",
        "playlist:read",
        "playlist:update",
        "playlist:delete",
        "playlist:destroy",

        // Analytics & Profile
        "analytics:read",
        "analytics:export",
        "user:read",
        "user:update",

        // Basic Access
        "sermon:read",
        "sermonbite:read",
      ];
    } else if (user.userType === EUserType.LISTENER) {
      rolePermissions = [
        "user:read",
        "user:update",
        "sermon:read",
        "sermonbite:read",
        "playlist:create",
        "playlist:read",
        "playlist:update",
        "playlist:delete",
      ];
    } else {
      rolePermissions = ["user:read", "sermon:read", "sermonbite:read"];
    }

    const role = await Role.findOne({ name: user.userType });
    if (!role) {
      throw new Error(`Role not found for user type: ${user.userType}`);
    }

    // Validate permissions against role's allowed permissions
    const validPermissions = rolePermissions.filter((p) =>
      role.permissions.includes(p)
    );

    user.role = role._id;
    user.role.permissions = validPermissions;

    return user;
  }

  /**
   * @name updatePermissions
   * @description Updates user permissions while validating against role-based permissions
   * @param user User object to update
   * @param permissionPayload New permissions to assign
   * @returns Updated user object
   */
  static async updatePermissions(
    user: IUserDoc,
    permissionPayload: IPermissionDTO
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const role = await Role.findOne({ slug: user.role });
    if (!role) {
      result.error = true;
      result.message = "Invalid user role";
      result.code = 400;
      return result;
    }

    const invalidPermissions = permissionPayload.permissions.filter(
      (p) => !role.permissions.includes(p)
    );

    if (invalidPermissions.length > 0) {
      result.error = true;
      result.message = `Invalid permissions for role ${
        role.name
      }: ${invalidPermissions.join(", ")}`;
      result.code = 400;
      return result;
    }

    user.role.permissions = permissionPayload.permissions;
    result.data = user;
    result.message = "Permissions updated successfully";
    return result;
  }

  /**
   * @name getRolePermissions
   * @description Gets all available permissions for a specific role
   * @param roleSlug Role slug to look up
   * @returns Array of permissions or null if role not found
   */
  static async getRolePermissions(roleSlug: string): Promise<string[] | null> {
    const role = await Role.findOne({ slug: roleSlug });
    return role ? role.permissions : null;
  }

  /**
   * @name getAllRoles
   * @description Returns all available roles and their permissions
   * @returns Array of role objects
   */
  static async getAllRoles(): Promise<any[]> {
    return Role.find({});
  }

  /**
   * @name hasPermission
   * @description Checks if a user has a specific permission
   * @param user User object to check
   * @param permission Permission to verify
   * @returns Boolean indicating if user has permission
   */
  static hasPermission(user: any, permission: string): boolean {
    return user.permissions?.includes(permission) || false;
  }

  /**
   * @name validateProfilePermissions
   * @description Validates permissions based on profile type
   * @param userType User type (listener, preacher, creator, staff)
   * @param permissions Permissions to validate
   */
  static async validateProfilePermissions(
    userType: EUserType,
    permissions: string[]
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const role = await Role.findOne({ name: userType });
    if (!role) {
      result.error = true;
      result.message = `Invalid profile type: ${userType}`;
      result.code = 400;
      return result;
    }

    const invalidPermissions = permissions.filter(
      (p) => !role.permissions.includes(p)
    );
    if (invalidPermissions.length > 0) {
      result.error = true;
      result.message = `Invalid permissions for ${userType}: ${invalidPermissions.join(
        ", "
      )}`;
      result.code = 400;
      return result;
    }

    result.data = { validPermissions: permissions };
    return result;
  }

  /**
   * @name updateProfilePermissions
   * @description Updates permissions for a specific profile type
   * @param userId User ID
   * @param userType Profile type
   * @param permissions New permissions to assign
   */
  static async updateProfilePermissions(
    userId: Types.ObjectId,
    userType: EUserType,
    permissions: string[]
  ): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    // Validate permissions first
    const validationResult = await this.validateProfilePermissions(
      userType,
      permissions
    );
    if (validationResult.error) {
      return validationResult;
    }

    try {
      // Update permissions based on profile type
      const updateQuery = { user: userId };
      const updateData = { permissions };

      switch (userType) {
        case EUserType.LISTENER:
          // Update listener profile permissions
          result.data = await Role.findOneAndUpdate(updateQuery, updateData, {
            new: true,
          });
          break;
        case EUserType.PREACHER:
          // Update preacher profile permissions
          result.data = await Role.findOneAndUpdate(updateQuery, updateData, {
            new: true,
          });
          break;
        case EUserType.CREATOR:
          // Update creator profile permissions
          result.data = await Role.findOneAndUpdate(updateQuery, updateData, {
            new: true,
          });
          break;
        case EUserType.STAFF:
          // Update staff profile permissions
          result.data = await Role.findOneAndUpdate(updateQuery, updateData, {
            new: true,
          });
          break;
        default:
          result.error = true;
          result.message = "Invalid profile type";
          result.code = 400;
          return result;
      }

      result.message = "Profile permissions updated successfully";
    } catch (error) {
      result.error = true;
      result.message = "Failed to update profile permissions";
      result.code = 500;
    }

    return result;
  }

  /**
   * @name hasProfilePermission
   * @description Checks if a specific profile has a permission
   * @param profile Profile object to check
   * @param permission Permission to verify
   */
  static hasProfilePermission(profile: any, permission: string): boolean {
    return profile?.permissions?.includes(permission) || false;
  }
}

export default PermissionService;

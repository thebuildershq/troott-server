import fs from "fs";
import logger from "../../utils/logger.util";
import Permission from "../../models/Permission.model";
import asyncHandler from "../../middlewares/async.mdw";
import Role from "../../models/Role.model";
import { EUserType } from "../../utils/enums.util";
import { IUserDoc } from "../../utils/interface.util";
import PermissionService from "../../services/permission.service";

/**
 * @description Reads and parses the permissions data from JSON file
 * @type {Object} permissionsData - Contains array of permission objects
 */
const permissionsData = JSON.parse(
  fs.readFileSync(
    `${__dirname.split("config")[0]}_data/permissions.json`,
    "utf-8"
  )
);

/**
 * @description Seeds the permissions collection in the database
 * @async
 * @function seedPermissions
 * @returns {Promise<void>}
 * @throws {Error} If there's an error reading the file or inserting data
 */
const seedPermissions = asyncHandler(async () => {
  const permissions = await Permission.countDocuments();

  if (permissions === 0) {
    const seed = await Permission.insertMany(permissionsData);

    if (seed) {
      logger.log({
        data: `${seed.length} permissions seeded successfully`,
        type: "info",
      });
    }

    const permissionsMap = new Map(seed.map((p) => [p.action, p._id]));

    const roles = await Role.find({});

    for (const role of roles) {
      const permissionActions =
        PermissionService.rolePermissionMap[role.name as EUserType] || [];

      const permissionIds = permissionActions
        .map((action) => permissionsMap.get(action))
        .filter((id) => id);

      role.permissions = permissionIds;
      await role.save();
    }

    logger.log({
      data: "Permissions assigned to roles successfully",
      type: "info",
    });
  } else {
    logger.log({
      data: "Permissions already exist, seeding skipped",
      type: "info",
    });
  }
});

export default seedPermissions;

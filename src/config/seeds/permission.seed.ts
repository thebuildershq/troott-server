import fs from "fs";
import logger from "../../utils/logger.util";
import Permission from "../../models/Permission.model";
import asyncHandler from "../../middlewares/async.mdw";
import Role from "../../models/Role.model";
import { EUserType } from "../../utils/enums.util";
import { IUserDoc } from "../../utils/interface.util";
import PermissionService from "../../services/permission.service";
import systemService from "../../services/system.service";

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

    // Log individual permissions for verification
    for (const permission of seed) {
      logger.log({
        data: `Permission ${permission.action} created
        with description: ${permission.description}`,
        type: "info",
      });
    }

    const Roles = await Role.find({});
    const permissionsMap = new Map(seed.map(p => [p.action, p._id]));

    
    for (const role of Roles) {
      const permissionActions = systemService.rolePermissionMap[role.name as EUserType] || [];
      const validPermissionIds = permissionActions
        .map(action => permissionsMap.get(action))
        .filter(Boolean); // Filters out undefined (non-existent) actions

      role.permissions = validPermissionIds;
      await role.save();
    }


    logger.log({
      data: "Permissions assigned to roles successfully",
      type: "info",
    });
  } else {
    logger.log({
      data: "Permissions already exist, skipping seed",
      type: "info",
    });
  }
});

export default seedPermissions;
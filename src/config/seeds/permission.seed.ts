import fs from "fs";
import logger from "../../utils/logger.util";
import Permission from "../../models/Permission.model";
import asyncHandler from "../../middlewares/async.mdw";

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
  } else {
    logger.log({
      data: "Permissions already exist, skipping seed",
      type: "info",
    });
  }
});

export default seedPermissions;

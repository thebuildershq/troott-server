import fs from "fs";
import logger from "../../utils/logger.util";
import User from "../../models/User.model";
import Role from "../../models/Role.model";
import { EUserType } from "../../utils/enums.util";
import ErrorResponse from "../../utils/error.util";
import asyncHandler from "../../middlewares/async.mdw";

/**
 * @description Reads and parses the users data from JSON file
 * @type {Object} userData - Contains array of user objects
 */
const userData = JSON.parse(
  fs.readFileSync(`${__dirname.split("config")[0]}_data/users.json`, "utf-8")
);


/**
 * @description Seeds the users collection in the database and associates users with roles
 * @async
 * @function seedUsers
 * @returns {Promise<void>}
 * @throws {ErrorResponse} If a specified role doesn't exist
 * @throws {Error} If there's an error reading the file or inserting data
 */

const seedUsers = async (): Promise<void> => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) return;

    let seededCount = 0;

    for (const item of userData) {
      const roleName = item.role || EUserType.USER;
      const role = await Role.findOne({ name: roleName });

      if (!role) {
        throw new ErrorResponse(`Role "${roleName}" does not exist.`, 400, []);
      }

      const newUser = await User.create({ ...item, role: role._id });
      if (newUser) {
        role.users.push(newUser._id);
        await role.save();
        seededCount++;
      } 
    }

    if (seededCount > 0) {
      logger.log({
        type: "success",
        data: `${seededCount} user(s) seeded successfully.`,
      });
    }

  } catch (err) {
    logger.log({ 
      label: "SEEDING_ERROR",
      type: "error",
      data: `User seeding failed: ${(err as Error).message}`,
     });
  }
};

export default seedUsers;
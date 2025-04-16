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
const seedUsers = asyncHandler(async () => {
 
  let count: number = 0;
  const users = await User.countDocuments();

  if (users === 0) {
    for (let i = 0; i < userData.length; i++) {
      let item = userData[i];
      const role = await Role.findOne({ name: item.role || EUserType.USER });

      if (!role) {
        return new ErrorResponse(
          `Role ${item.role ?? EUserType.USER} does not exist.`,
          400,
          []
        );
      }

      let user = await User.create({ ...item, role: role._id });
      if (user) {
        count += 1;
        role.users = [...role.users, user._id];
        await role.save();
      }
    }
  }

  if (count > 0) {
    logger.log({
      data: "User data seeded successfully",
      type: "success",
    });
  }
});

export default seedUsers;
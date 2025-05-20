import seedUsers from "./user.seed";
import seedRoles from "./role.seed";
import seedPermissions from "./permission.seed";


/**
 * @description Seeds all collections in the database in the correct order:
 * 1. Users
 * 2. Roles
 * 3. Permissions
 * @async
 * @function seedData
 * @returns {Promise<void>}
 * @throws {Error} If any of the seeding operations fail
 */
const seedData = async () => {
    
    await seedRoles();
    await seedPermissions();
    await seedUsers();

}

export default seedData;
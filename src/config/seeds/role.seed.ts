import Role from "../../models/Role.model";
import logger from "../../utils/logger.util";
import rolesData from "../../_data/roles.json";



export const seedRoles = async () => {
  try {
    const roles = await Role.countDocuments();
    if (roles === 0) {
      const seed = await Role.insertMany(rolesData);
      if (seed) {
        logger.log({ data: `roles seeded successfully`, type: `info` });
      }
    }
  } catch (error) {
    logger.log({ label: "ERR:", data: error, type: `error` });
  }
};

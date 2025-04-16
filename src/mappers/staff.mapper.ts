import { StaffProfileDTO } from "../dtos/staff.dto";
import { IStaffProfileDoc } from "../interfaces/staff.interface";

class StaffMapper {
  constructor() {}

  /**
   * @name mapStaffProfile
   * @param staff
   * @returns StaffProfileDTO
   */
  public async mapStaffProfile(staff: IStaffProfileDoc): Promise<StaffProfileDTO> {
    const result: StaffProfileDTO = {
      id: staff.id.toString(),
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,

      gender: staff.gender,
      avatar: staff.avatar,
      dateOfBirth: staff.dateOfBirth,
      country: staff.country,
      phoneNumber: staff.phoneNumber,
      phoneCode: staff.phoneCode,
      location: staff.location,
      slug: staff.slug,

      unit: staff.unit,
      role: staff.role,
      accessLevel: staff.accessLevel,
      permissions: staff.permissions,

      lastLogin: staff.lastLogin,
      devices: staff.devices.map((device) => ({
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        lastUsed: device.lastUsed,
      })),

      publishedCount: staff.publishedCount,
      isVerified: staff.isVerified,
      isActive: staff.isActive,
      isSuspended: staff.isSuspended,

      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };

    return result;
  }
}

export default new StaffMapper();

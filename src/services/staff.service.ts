import { createStaffDTO } from "../dtos/profile.dto";
import Staff from "../models/Staff.model";
import { IStaffDoc, IResult, IUserDoc } from "../utils/interface.util";
import { EUserType } from "../utils/enums.util";
import { generateRandomChars } from "../utils/helper.util";
import SystemService from "./system.service";

class StaffService {
  public async createStaff(
    data: createStaffDTO
  ): Promise<IResult<{ staff: IStaffDoc; user: IUserDoc }>> {
    const result: IResult<{ staff: IStaffDoc; user: IUserDoc }> = {
      error: false,
      message: "",
      code: 200,
      data: {},
    };
  
    const { user } = data;
  
    const existingStaff = await Staff.findOne({ user: user._id });
    if (existingStaff) {
      return {
        error: true,
        message: "Staff profile already exists for this user",
        code: 400,
        data: {},
      };
    }
  
    const staffProfileData = {
      _id: user._id,
      id: user.id,
      staffID: generateRandomChars(12),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phoneCode: user.phoneCode,
      country: user.country,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      type: EUserType.STAFF,
      user: user._id,
      isActive: true,
      isSuspended: false,
      isDeleted: false,
    };
  
    const staff = await Staff.create(staffProfileData);
  
    user.profiles = {
      ...user.profiles,
      staff: staff._id,
    };
    await user.save();
  
    return {
      error: false,
      message: "Staff profile created",
      code: 201,
      data: { staff, user },
    };
  }
  
  public async updateStaffProfile(
    id: string,
    data: Partial<IStaffProfileDoc>
  ): Promise<IStaffProfileDoc> {
    const updatedStaff = await Staff.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedStaff) {
      throw new Error("Staff profile not found");
    }

    return updatedStaff;
  }

  public async generateAPIKey(staffId: string): Promise<string> {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    const apiKey = generateRandomChars(52);
    await Staff.findByIdAndUpdate(staffId, {
      $push: {
        apiKeys: {
          key: apiKey,
          createdAt: new Date(),
          lastUsed: new Date()
        }
      }
    });

    return apiKey;
  }

  public async revokeAPIKey(staffId: string, keyId: string): Promise<void> {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    await Staff.findByIdAndUpdate(staffId, {
      $pull: {
        apiKeys: { key: keyId }
      }
    });
  }

  
  /**
   * @name encryptApiKeys
   * @param staff
   * @param ApiKey
   * @returns
   */
  public async encryptApiKeys(
    staff: IStaffDoc,
    apikey: string
  ): Promise<boolean> {
    try {
      const encrypted = await SystemService.encryptData({
        payload: apikey,
        password: staff.email,
        separator: "-",
      });

      if (encrypted) {
        // Fix: Add the apiKey to the staff's apiKeys array
        if (!staff.apiKeys) {
          staff.apiKeys = [];
        }
        
        staff.apiKeys.push({
          key: encrypted,
          createdAt: new Date(),
          lastUsed: new Date()
        });
        
        await staff.save();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error encrypting API key:", error);
      return false;
    }
  }
  /**
   * @name decryptApiKeys
   * @param user
   * @returns
   */
  public async decryptApiKeys(staff: IStaffDoc, keyIndex?: number): Promise<string | null> {
    try {
      if (!staff.apiKeys || staff.apiKeys.length === 0) {
        return null;
      }

      const targetKey = typeof keyIndex === 'number' 
        ? staff.apiKeys[keyIndex]
        : staff.apiKeys[staff.apiKeys.length - 1];

      if (!targetKey) {
        return null;
      }

      const decrypted = await SystemService.decryptData({
        password: staff.email,
        payload: targetKey.key,
        separator: "-",
      });

      return decrypted.data?.toString() || null;
    } catch (error) {
      console.error("Error decrypting API key:", error);
      return null;
    }
  }




  public async manageIPWhitelist(staffId: string, ips: string[]): Promise<void> {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    await Staff.findByIdAndUpdate(staffId, {
      $set: { ipWhitelist: ips }
    });
  }

  public async recordAction(
    staffId: string,
    action: string,
    targetId: string
  ): Promise<void> {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    await Staff.findByIdAndUpdate(staffId, {
      $push: {
        actionsTaken: {
          action,
          targetId,
          timestamp: new Date()
        }
      }
    });
  }

  public async moderateContent(
    staffId: string,
    contentId: string
  ): Promise<void> {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    await Staff.findByIdAndUpdate(staffId, {
      $push: {
        moderatedContent: contentId
      }
    });

    await this.recordAction(staffId, 'content_moderation', contentId.toString());
  }

  public async updatePermissions(
    staffId: string,
    permissions: Array<string> 
  ): Promise<void> {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    await Staff.findByIdAndUpdate(staffId, {
      $set: { permissions }
    });

    await this.recordAction(
      staffId,
      'permissions_updated',
      `Updated permissions: ${permissions.join(', ')}`
    );
  }

  public async updateAccessLevel(
    staffId: string,
    level: number
  ): Promise<void> {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    await Staff.findByIdAndUpdate(staffId, {
      $set: { accessLevel: level }
    });

    await this.recordAction(
      staffId,
      'access_level_updated',
      `Updated access level to: ${level}`
    );
  }

  public async getStaffProfile(userId: string): Promise<IResult> {
    const result: IResult = { error: false, message: "", code: 200, data: {} };

    const staff = await Staff.findOne({ user: userId })
      .populate("moderatedContent")
      .populate("actionsTaken")
      .select("-apiKeys.key"); // Exclude sensitive API key data

    if (!staff) {
      result.error = true;
      result.message = "Staff profile not found";
      result.code = 404;
      return result;
    }

    result.data = staff;
    return result;
  }
}

export default new StaffService();
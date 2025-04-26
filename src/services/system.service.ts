import crypto from "crypto";
import { IResult, IStaffDoc, IUserDoc } from "../utils/interface.util";
import { DecryptDataDTO, EncryptDataDTO } from "../dtos/system.dto";
import { EUserType } from "../utils/enums.util";

class SystemService {
  public result: IResult;

  constructor() {
    this.result = { error: false, message: "", code: 200, data: {} };
  }

  /**
   * Private method for encrypting data using AES-GCM
   * @param data - Object containing the payload to encrypt
   * @param data.payload - String to encrypt
   * @param password - Password used for key derivation
   * @param iv - Optional initialization vector (Buffer)
   * @returns Object containing encryption result, encrypted data, and IV
   */
  private static encryptAESGCM(
    data: { payload: string },
    password: string,
    iv?: Buffer
  ): { error: boolean; data?: string; vector?: string } {
    try {
      const key = crypto.createHash("sha256").update(password).digest();

      // If IV is not provided, generate a new random one
      const vector = iv || crypto.randomBytes(12);

      const cipher = crypto.createCipheriv("aes-256-gcm", key, vector);
      let encrypted = cipher.update(data.payload, "utf8", "hex");
      encrypted += cipher.final("hex");

      return {
        error: false,
        data: encrypted,
        vector: vector.toString("hex"), // Store IV as hex
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      return { error: true };
    }
  }

  /**
   * Encrypts data using AES-GCM with a custom separator
   * @param data - Encryption data transfer object
   * @param data.password - Password for encryption
   * @param data.separator - Separator for combining encrypted data and IV
   * @param data.payload - Data to encrypt
   * @returns Promise resolving to encrypted string
   */
  public async encryptData(data: EncryptDataDTO): Promise<string> {
    let result: string = "";
    const { password, separator, payload } = data;

    // Generate a fixed IV from the email
    const iv = crypto
      .createHash("sha256")
      .update(password)
      .digest()
      .slice(0, 12); // 12-byte IV

    const encrypted = SystemService.encryptAESGCM({ payload }, password, iv);

    if (encrypted.error === false) {
      result = encrypted.data + separator + iv.toString("hex"); // Convert IV to hex
    }

    return result;
  }

  /**
   * Private method for decrypting AES-GCM encrypted data
   * @param data - Object containing the encrypted payload
   * @param data.payload - Encrypted string to decrypt
   * @param password - Password used for key derivation
   * @param iv - Initialization vector (Buffer)
   * @returns Object containing decryption result and decrypted data
   */
  private static decryptAESGCM(
    data: { payload: string },
    password: string,
    iv: Buffer
  ): { error: boolean; data?: string } {
    try {
      const key = crypto.createHash("sha256").update(password).digest();
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

      let decrypted = decipher.update(data.payload, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return { error: false, data: decrypted };
    } catch (error) {
      console.error("Decryption failed:", error);
      return { error: true };
    }
  }

  /**
   * Decrypts data that was encrypted using AES-GCM
   * @param data - Decryption data transfer object
   * @param data.password - Password for decryption
   * @param data.payload - Encrypted data to decrypt
   * @param data.separator - Separator used in encrypted data
   * @returns Promise resolving to decryption result
   */
  public async decryptData(data: DecryptDataDTO): Promise<any> {
    let result: any = null;
    const { password, payload, separator } = data;

    try {
      const hashed = payload.split(separator);
      if (hashed.length !== 2) {
        return { error: true, message: "Invalid encrypted format" };
      }

      const cipher = hashed[0];
      const vector = Buffer.from(hashed[1], "hex"); // Convert IV from hex to Buffer

      let decrypted = SystemService.decryptAESGCM(
        { payload: cipher },
        password,
        vector
      );

      if (decrypted.error || !decrypted.data) {
        return { error: true, message: "Decryption failed" };
      }

      // ✅ Fix: Ensure decrypted.data is a valid string before parsing
      if (typeof decrypted.data !== "string") {
        return { error: true, message: "Decryption returned invalid data" };
      }

      // ✅ Safe JSON parsing
      try {
        const parsed = JSON.parse(decrypted.data);
        decrypted.data = parsed.payload; // Ensure it contains a 'payload' key
      } catch (error) {
        return {
          error: true,
          message: "Invalid JSON format in decrypted data",
        };
      }

      result = decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      return { error: true, message: "Unexpected error during decryption" };
    }

    return result;
  }

  /**
   * Generates a secure API key with customizable length and optional prefix
   * @param length - Length of the API key (default: 32)
   * @param prefix - Optional prefix to add to the API key
   * @returns Generated API key string
   * @throws Error if API key generation fails
   */
  public async generateAPIKey(
    length: number = 32,
    prefix?: string
  ): Promise<string> {
    try {
      // Generate random bytes for the API key
      const randomBytes = crypto.randomBytes(length);
      let apiKey = randomBytes
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, length);

      if (prefix) {
        apiKey = `${prefix}_${apiKey}`;
      }

      // Encrypt the API key
      const encryptedKey = await this.encryptData({
        payload: apiKey,
        password: process.env.API_KEY_SECRET || "default-secret",
        separator: ".",
      });

      return encryptedKey;
    } catch (error) {
      console.error("API key generation failed:", error);
      throw new Error("Failed to generate API key");
    }
  }

  /**
   * Revokes an API key by adding it to a blacklist
   * @param apiKey - API key to revoke
   * @returns Promise resolving to operation result
   * @throws Error if revocation fails
   */
  public async validateAPIKey(apiKey: string): Promise<IResult> {
    try {
      // Decrypt the API key
      const decrypted = await this.decryptData({
        payload: apiKey,
        password: process.env.API_KEY_SECRET || "default-secret",
        separator: ".",
      });

      if (decrypted.error || !decrypted.data) {
        this.result.error = true;
        this.result.message = "Invalid API key";
        this.result.code = 400;
        return this.result;
      }

      // Basic format validation on decrypted key
      const apiKeyRegex = /^[A-Za-z0-9_-]+$/;
      if (!apiKeyRegex.test(decrypted.data)) {
        this.result.error = true;
        this.result.message = "Invalid API key format";
        this.result.code = 400;
        return this.result;
      }

      this.result.error = false;
      this.result.message = "API key is valid";
      this.result.code = 200;
      this.result.data = { originalKey: decrypted.data };
      return this.result;
    } catch (error) {
      console.error("API key validation failed:", error);
      this.result.error = true;
      this.result.message = "Failed to validate API key";
      this.result.code = 500;
      return this.result;
    }
  }

  /**
   * Rotates an API key by generating a new one and revoking the old one
   * @param currentApiKey - Current API key to rotate
   * @returns Promise resolving to rotation result containing new API key
   * @throws Error if rotation process fails
   */
  public async rotateAPIKey(currentApiKey: string): Promise<IResult> {
    try {
      // Validate current key
      const validationResult = await this.validateAPIKey(currentApiKey);
      if (validationResult.error) {
        return validationResult;
      }

      // Generate new API key
      const newApiKey = await this.generateAPIKey();

      // Store rotation record
      const rotationTimestamp = new Date().toISOString();

      this.result.error = false;
      this.result.message = "API key successfully rotated";
      this.result.data = {
        newApiKey,
        rotatedAt: rotationTimestamp,
        previousKey: validationResult.data.originalKey,
      };

      return this.result;
    } catch (error) {
      console.error("API key rotation failed:", error);
      this.result.error = true;
      this.result.message = "Failed to rotate API key";
      this.result.code = 500;
      return this.result;
    }
  }

  /**
   * Encrypts a user's API key
   * @param user - User document
   * @param apiKey - API key to encrypt
   * @returns Promise<boolean> - Success status
   */
  public async encryptUserAPIKey(
    user: IStaffDoc,
    apiKey: string
  ): Promise<boolean> {
    let result: boolean = false;

    const encrypted = await this.encryptData({
      payload: apiKey,
      password: `${user.email}_apikey`,
      separator: ".",
    });

    if (encrypted) {
      const newApiKey = {
        key: encrypted,
        createdAt: new Date(),
        lastUsed: new Date(),
      };

      if (!user.apiKeys) {
        user.apiKeys = [];
      }

      user.apiKeys.push(newApiKey);
      await user.save();
      return true;
    }

    return result;
  }

  /**
   * Decrypts a user's API key
   * @param user - User document
   * @returns Promise<string | null> - Decrypted API key or null
   */
  public async decryptUserAPIKey(
    user: IStaffDoc,
    keyIndex?: number
  ): Promise<string | null> {
    if (!user.apiKeys) {
      return null;
    }

    if (!user.apiKeys || user.apiKeys.length === 0) {
      return null;
    }

    // If no index provided, decrypt the latest key
    const targetKey =
      typeof keyIndex === "number"
        ? user.apiKeys[keyIndex]
        : user.apiKeys[user.apiKeys.length - 1];

    if (!targetKey) {
      return null;
    }

    const decrypted = await this.decryptData({
      password: `${user.email}_apikey`,
      payload: targetKey.key,
      separator: ".",
    });

    if (decrypted.error || !decrypted.data) {
      return null;
    }

    return decrypted.data.toString();
  }

  
  private static rolePermissionMap: Record<string, string[]> = {
    [EUserType.SUPERADMIN]: [
      // System Management
      "system:read", "system:update", "system:configure", "system:restart",

      // User Management
      "user:create", "user:read", "user:update", "user:delete", "user:disable",

      // Role & Permission Management
      "role:create", "role:read", "role:update", "role:delete", "role:disable",
      "permission:create", "permission:read", "permission:update", "permission:delete", "permission:disable",

      // Content Management
      "sermon:create", "sermon:read", "sermon:update", "sermon:delete", "sermon:destroy",
      "sermonbite:create", "sermonbite:read", "sermonbite:update", "sermonbite:delete", "sermonbite:destroy",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete", "playlist:destroy", "playlist:disable",

      // Subscription & Transaction Management
      "subscription:create", "subscription:read", "subscription:update", "subscription:cancel",
      "transaction:create", "transaction:read", "transaction:update", "transaction:refund",
      "plan:create", "plan:read", "plan:update", "plan:delete",

      // API Management
      "apikey:create", "apikey:read", "apikey:update", "apikey:disable", "apikey:delete",

      // Analytics & Revenue
      "analytics:read", "analytics:update", "analytics:export",
      "revenue:read", "revenue:update",

      // Advertisement Management
      "ads:create", "ads:read", "ads:update", "ads:delete"
    ],
    [EUserType.STAFF]: [
      "user:create", "user:read", "user:update", "user:delete", "user:disable",
      "role:create", "role:read", "role:update", "role:delete", "role:disable",
      "permission:create", "permission:read", "permission:update", "permission:delete", "permission:disable",
      "sermon:create", "sermon:read", "sermon:update", "sermon:delete", "sermon:destroy",
      "sermonbite:create", "sermonbite:read", "sermonbite:update", "sermonbite:delete", "sermonbite:destroy",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete", "playlist:destroy", "playlist:disable",
      "subscription:create", "subscription:read", "subscription:update", "subscription:cancel",
      "transaction:create", "transaction:read", "transaction:update", "transaction:refund",
      "plan:create", "plan:read", "plan:update", "plan:delete",
      "apikey:create", "apikey:read", "apikey:update", "apikey:disable", "apikey:delete",
      "analytics:read", "analytics:update", "analytics:export",
      "revenue:read", "revenue:update",
      "ads:create", "ads:read", "ads:update", "ads:delete"
    ],
    [EUserType.PREACHER]: [
      "sermon:create", "sermon:read", "sermon:update", "sermon:delete", "sermon:destroy",
      "sermonbite:create", "sermonbite:read", "sermonbite:update", "sermonbite:delete", "sermonbite:destroy",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete", "playlist:destroy", "playlist:disable",
      "analytics:read", "analytics:export",
      "user:read", "user:update"
    ],
    [EUserType.CREATOR]: [
      "sermonbite:create", "sermonbite:read", "sermonbite:update", "sermonbite:delete",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete", "playlist:destroy",
      "analytics:read", "analytics:export",
      "user:read", "user:update",
      "sermon:read", "sermonbite:read"
    ],
    [EUserType.LISTENER]: [
      "user:read", "user:update",
      "sermon:read", "sermonbite:read",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete"
    ],
    [EUserType.USER]: [
      "user:read",
      "sermon:read",
      "sermonbite:read"
    ]
  }

  // private async storeKeyMetadata(metadata: IAPIKeyMetadata): Promise<void> {
  //   try {
  //     await APIKey.create(metadata);
  //   } catch (error) {
  //     console.error('Failed to store API key metadata:', error);
  //     throw new Error('Failed to store API key metadata');
  //   }
  // }

  // private async getKeyMetadata(keyHash: string): Promise<IAPIKeyMetadata | null> {
  //   try {
  //     return await APIKey.findOne({ keyHash }).lean();
  //   } catch (error) {
  //     console.error('Failed to retrieve API key metadata:', error);
  //     throw new Error('Failed to retrieve API key metadata');
  //   }
  // }

  // private async updateKeyLastUsed(keyHash: string): Promise<void> {
  //   try {
  //     await APIKey.findOneAndUpdate(
  //       { keyHash },
  //       {
  //         $set: { lastUsed: new Date() }
  //       }
  //     );
  //   } catch (error) {
  //     console.error('Failed to update API key last used:', error);
  //     throw new Error('Failed to update API key usage');
  //   }
  // }

  // private async updateKeyStatus(
  //   keyHash: string,
  //   status: EAPIKeyStatus,
  //   userId?: string
  // ): Promise<void> {
  //   try {
  //     const update: any = {
  //       status,
  //       ...(status === EAPIKeyStatus.REVOKED && {
  //         revokedAt: new Date(),
  //         revokedBy: userId
  //       })
  //     };

  //     await APIKey.findOneAndUpdate(
  //       { keyHash },
  //       { $set: update }
  //     );
  //   } catch (error) {
  //     console.error('Failed to update API key status:', error);
  //     throw new Error('Failed to update API key status');
  //   }
  // }

  // private async logKeyUsage(usage: APIKeyUsageDTO): Promise<void> {
  //   try {
  //     await APIKeyUsage.create({
  //       ...usage,
  //       timestamp: new Date()
  //     });
  //   } catch (error) {
  //     console.error('Failed to log API key usage:', error);
  //     // Don't throw error to prevent disrupting the main flow
  //   }
  // }

  // private async checkKeyQuota(keyHash: string): Promise<boolean> {
  //   try {
  //     const now = new Date();
  //     const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  //     const usageCount = await APIKeyUsage.countDocuments({
  //       keyHash,
  //       timestamp: { $gte: hourAgo }
  //     });

  //     // Example: 1000 requests per hour limit
  //     return usageCount < 1000;
  //   } catch (error) {
  //     console.error('Failed to check API key quota:', error);
  //     return false;
  //   }
  // }

  // private async cleanupExpiredKeys(): Promise<void> {
  //   try {
  //     const now = new Date();
  //     await APIKey.updateMany(
  //       {
  //         expiresAt: { $lt: now },
  //         status: EAPIKeyStatus.ACTIVE
  //       },
  //       {
  //         $set: {
  //           status: EAPIKeyStatus.EXPIRED,
  //           revokedAt: now
  //         }
  //       }
  //     );
  //   } catch (error) {
  //     console.error('Failed to cleanup expired keys:', error);
  //   }
  // }
}

export default new SystemService();

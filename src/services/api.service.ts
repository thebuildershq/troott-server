import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { IApiKeyDoc, IResult } from "../utils/interface.util";
import ErrorResponse from "../utils/error.util";
import ApiKey from "../models/ApiKey.model";
import User from "../models/User.model";

class ApiKeyService {
  private expireTime: number;

  constructor() {
    this.expireTime = parseInt(process.env.API_KEY_EXPIRY_DAYS || "30") * 86400000;
  }

  /**
   * Generates a secure API key and attaches it to a user.
   */
  public async generateApiKey(userId: string, permissions: string[]): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      if (!userId) throw new ErrorResponse("Invalid user ID", 400);
      if (!permissions || !Array.isArray(permissions)) {
        throw new ErrorResponse("Invalid permissions", 400);
      }

      const rawKey = uuidv4() + "-" + crypto.randomBytes(32).toString("hex");
      const keyId = uuidv4();
      const keyHash = this.hashApiKey(rawKey);
      const expiresAt = new Date(Date.now() + this.expireTime);

      const newApiKey = new ApiKey({ id: keyId, userId, keyHash, expiresAt, permissions });
      await newApiKey.save();

      result.data = { apiKey: rawKey };
      result.message = "API Key generated successfully";
    } catch (error: any) {
      result.error = true;
      result.code = 500;
      result.message = `Failed to generate API key: ${error.message}`;
    }

    return result;
  }

  /**
   * Verifies if an API key is valid.
   */
  public async verifyApiKey(apiKey: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      if (!apiKey) throw new ErrorResponse("API key required", 400);

      const keyHash = this.hashApiKey(apiKey);
      const keyRecord = await ApiKey.findOne({ keyHash });

      if (!keyRecord) throw new ErrorResponse("Invalid API key", 401);
      if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
        throw new ErrorResponse("API key expired", 401);
      }

      result.data = { valid: true, permissions: keyRecord.permissions };
      result.message = "API Key is valid";
    } catch (error: any) {
      result.error = true;
      result.code = 401;
      result.message = `Failed to verify API key: ${error.message}`;
    }

    return result;
  }

  /**
   * Refresh API key before expiry.
   */
  public async refreshApiKey(apiKey: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      if (!apiKey) throw new ErrorResponse("API key required", 400);

      const keyHash = this.hashApiKey(apiKey);
      const keyRecord = await ApiKey.findOne({ keyHash });

      if (!keyRecord) throw new ErrorResponse("Invalid API key", 401);
      if (!this.checkExpiration(keyRecord.expiresAt)) {
        throw new ErrorResponse("API key is still valid, no refresh needed", 400);
      }

      const newApiKey = uuidv4() + "-" + crypto.randomBytes(32).toString("hex");
      keyRecord.keyHash = this.hashApiKey(newApiKey);
      keyRecord.expiresAt = new Date(Date.now() + this.expireTime);
      await keyRecord.save();

      result.data = { apiKey: newApiKey };
      result.message = "API Key refreshed successfully";
    } catch (error: any) {
      result.error = true;
      result.code = 401;
      result.message = `Failed to refresh API key: ${error.message}`;
    }

    return result;
  }

  /**
   * Detach API key (Revoke access).
   */
  public async detachApiKey(userId: string): Promise<IResult> {
    let result: IResult = { error: false, message: "", code: 200, data: {} };

    try {
      await ApiKey.deleteMany({ userId });

      result.message = "API key revoked successfully";
    } catch (error: any) {
      result.error = true;
      result.code = 500;
      result.message = `Failed to detach API key: ${error.message}`;
    }

    return result;
  }

  /**
   * Hash API key for secure storage.
   */
  private hashApiKey(apiKey: string): string {
    return crypto.createHash("sha256").update(apiKey).digest("hex");
  }

  /**
   * Checks if API key is close to expiration.
   */
  private checkExpiration(expirationDate: Date): boolean {
    const timeLeft = expirationDate.getTime() - Date.now();
    return timeLeft <= 5 * 60 * 60 * 1000; // Refresh if less than 5 hours remaining
  }
}

export default new ApiKeyService();

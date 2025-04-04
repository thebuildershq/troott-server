import { IResult } from "../utils/interface.util";
import { DecryptDataDTO, EncryptDataDTO } from "../dtos/system.dto";
import crypto from "crypto";

class SystemService {
  public result: IResult;

  constructor() {
    this.result = { error: false, message: "", code: 200, data: {} };
  }

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
   * Decrypts AES-GCM encrypted data
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
}

export default new SystemService();

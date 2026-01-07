// AES-256 Encryption utilities

import CryptoJS from "crypto-js";
import { ENCRYPTION_ALGORITHM, IV_LENGTH } from "./constants";

const SECRET_KEY = process.env.ENCRYPTION_KEY || "default-secret-key-change-in-production";

/**
 * Encrypt data using AES-256
 */
export function encrypt(data: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt data using AES-256
 */
export function decrypt(encryptedData: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error("Failed to decrypt data - invalid key or corrupted data");
    }
    
    return decryptedString;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Encrypt object (converts to JSON first)
 */
export function encryptObject<T>(obj: T): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt object (parses JSON after decryption)
 */
export function decryptObject<T>(encryptedData: string): T {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted) as T;
}

/**
 * Hash password (for user authentication)
 */
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = CryptoJS.SHA256(password).toString();
  return passwordHash === hash;
}

/**
 * Generate device ID from device info
 */
export function generateDeviceId(deviceInfo: {
  userAgent: string;
  platform: string;
  hardwareConcurrency?: number;
}): string {
  const deviceString = `${deviceInfo.userAgent}-${deviceInfo.platform}-${deviceInfo.hardwareConcurrency || "unknown"}`;
  return CryptoJS.SHA256(deviceString).toString().substring(0, 32);
}

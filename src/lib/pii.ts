import crypto from "node:crypto";

function getKeyMaterial(): string {
  const key = process.env.DATA_ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!key) {
    throw new Error("DATA_ENCRYPTION_KEY または SESSION_SECRET が設定されていません。");
  }
  return key;
}

function getKey(): Buffer {
  return crypto.createHash("sha256").update(getKeyMaterial()).digest();
}

export function encryptPatientCardNumber(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function getPatientCardLookupHash(value: string): string {
  const secret = process.env.CARD_NUMBER_HMAC_SECRET || getKeyMaterial();
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function normalizePatientCardNumber(value: string): string {
  return value.trim().replace(/[\s-]/g, "");
}

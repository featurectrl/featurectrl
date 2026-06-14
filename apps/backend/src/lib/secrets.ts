import { createHash, randomBytes } from "node:crypto";

export const API_KEY_PREFIX = "fctrl_sk";

export const PUBLIC_KEY_PREFIX = "fctrl_pk";

export function generateSecretKey(prefix: string): string {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

export function hashSecretKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

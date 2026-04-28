import { randomBytes } from "node:crypto";

export function generateSecretKey(prefix: string): string {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

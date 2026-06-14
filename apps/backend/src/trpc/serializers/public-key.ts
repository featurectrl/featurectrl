import type { InferSelectModel } from "drizzle-orm";
import { maskApiKeyKey } from "@/app/api-key";
import type { publicKey } from "@/db/schema";

export type PublicKey = Pick<
  InferSelectModel<typeof publicKey>,
  "id" | "displayName" | "expiresAt" | "createdAt"
> & {
  // Safe to expose: returned in full so the UI can reveal it, plus a masked default.
  key: string;
  keyMasked: string;
};

export type PublicKeySecret = {
  key: string;
};

export function serializePublicKey(row: InferSelectModel<typeof publicKey>): PublicKey {
  return {
    id: row.id,
    displayName: row.displayName,
    key: row.key,
    keyMasked: maskApiKeyKey(row.key),
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

export function serializePublicKeySecret(key: string): PublicKeySecret {
  return { key };
}

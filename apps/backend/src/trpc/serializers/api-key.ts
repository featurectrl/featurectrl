import type { InferSelectModel } from "drizzle-orm";
import type { apiKey } from "@/db/schema";
import { API_KEY_PREFIX } from "@/lib/secrets";

export type ApiKey = Pick<
  InferSelectModel<typeof apiKey>,
  "id" | "displayName" | "expiresAt" | "createdAt"
> & {
  keyMasked: string;
};

export type ApiKeySecret = {
  key: string;
};

export function serializeApiKey(row: InferSelectModel<typeof apiKey>): ApiKey {
  return {
    id: row.id,
    displayName: row.displayName,
    keyMasked: `${API_KEY_PREFIX}_****`,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

export function serializeApiKeySecret(key: string): ApiKeySecret {
  return { key };
}

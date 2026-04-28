import type { InferSelectModel } from "drizzle-orm";
import { maskApiKeyKey } from "@/app/api-key";
import type { apiKey } from "@/db/schema";

export type ApiKey = Pick<InferSelectModel<typeof apiKey>, "id" | "displayName" | "createdAt"> & {
  publicKeyMasked: string;
  privateKeyMasked: string;
};

export type ApiKeySecrets = {
  publicKey: string;
  privateKey: string;
};

export function serializeApiKeySecrets(row: InferSelectModel<typeof apiKey>): ApiKeySecrets {
  return {
    publicKey: row.publicKey,
    privateKey: row.privateKey,
  };
}

export function serializeApiKey(row: InferSelectModel<typeof apiKey>): ApiKey {
  return {
    id: row.id,
    displayName: row.displayName,
    publicKeyMasked: maskApiKeyKey(row.publicKey),
    privateKeyMasked: maskApiKeyKey(row.privateKey),
    createdAt: row.createdAt,
  };
}

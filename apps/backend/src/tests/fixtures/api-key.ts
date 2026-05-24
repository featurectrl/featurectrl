import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { Tx } from "@/db";
import { apiKey } from "@/db/schema";
import { generateSecretKey } from "@/lib/secrets";

export type CreateTestApiKeyInput = {
  organizationId: string;
  displayName?: string;
  publicKey?: string;
  privateKey?: string;
};

export async function createTestApiKey(
  tx: Tx,
  { organizationId, displayName, publicKey, privateKey }: CreateTestApiKeyInput,
) {
  const apiKeyId = uuidv7();

  displayName = displayName ?? faker.food.fruit();
  publicKey = publicKey ?? generateSecretKey("test_pk");
  privateKey = privateKey ?? generateSecretKey("test_sk");

  const [instance] = await tx
    .insert(apiKey)
    .values({
      id: apiKeyId,
      organizationId,
      displayName,
      publicKey,
      privateKey,
    })
    .returning();

  return instance;
}

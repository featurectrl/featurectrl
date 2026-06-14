import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { Tx } from "@/db";
import { apiKey } from "@/db/schema";
import { generateSecretKey, hashSecretKey } from "@/lib/secrets";

export type CreateTestApiKeyInput = {
  organizationId: string;
  displayName?: string;
  key?: string;
  expiresAt?: Date | null;
};

export async function createTestApiKey(
  tx: Tx,
  { organizationId, displayName, key, expiresAt = null }: CreateTestApiKeyInput,
) {
  displayName = displayName ?? faker.food.fruit();
  key = key ?? generateSecretKey("test_sk");

  const [instance] = await tx
    .insert(apiKey)
    .values({
      id: uuidv7(),
      organizationId,
      displayName,
      hashedKey: hashSecretKey(key),
      expiresAt,
    })
    .returning();

  // The plaintext secret is only known here; return it so tests can authenticate.
  return { ...instance, key };
}

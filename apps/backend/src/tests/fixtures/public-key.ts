import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { Tx } from "@/db";
import { publicKey } from "@/db/schema";
import { generateSecretKey } from "@/lib/secrets";

export type CreateTestPublicKeyInput = {
  organizationId: string;
  displayName?: string;
  key?: string;
  expiresAt?: Date | null;
};

export async function createTestPublicKey(
  tx: Tx,
  { organizationId, displayName, key, expiresAt = null }: CreateTestPublicKeyInput,
) {
  displayName = displayName ?? faker.food.fruit();
  key = key ?? generateSecretKey("test_pk");

  const [instance] = await tx
    .insert(publicKey)
    .values({
      id: uuidv7(),
      organizationId,
      displayName,
      key,
      expiresAt,
    })
    .returning();

  return instance;
}

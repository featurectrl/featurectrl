import { v7 as uuidv7 } from "uuid";
import type { Tx } from "@/db";
import { environment } from "@/db/schema";

type CreateEnvironmentsInput = {
  organizationId: string;
  displayName?: string;
  name: string;
}[];

export async function createTestEnvironments(tx: Tx, input: CreateEnvironmentsInput) {
  return tx
    .insert(environment)
    .values(
      input.map((item) => {
        return {
          ...item,

          id: uuidv7(),
          displayName: item.displayName ?? item.name,
        };
      }),
    )
    .returning();
}

type CreateEnvironmentInput = {
  organizationId: string;
  displayName?: string;
  name: string;
};

export async function createTestEnvironment(tx: Tx, input: CreateEnvironmentInput) {
  const [instance] = await createTestEnvironments(tx, [input]);
  return instance;
}

import { faker } from "@faker-js/faker";
import { and, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import type { Tx } from "@/db";
import { type FeatureFlagValue, featureFlag, featureFlagValue } from "@/db/schema";

type CreateTestFeatureFlagInput = CreateTestFeatureFlagsInput[number];

export async function createTestFeatureFlag(tx: Tx, input: CreateTestFeatureFlagInput) {
  const [instance] = await createTestFeatureFlags(tx, [input]);
  return instance;
}

type CreateTestFeatureFlagsInput = {
  organizationId: string;
  name?: string;
  defaultValue?: FeatureFlagValue;
  archived?: boolean;
}[];

export async function createTestFeatureFlags(tx: Tx, input: CreateTestFeatureFlagsInput) {
  return tx
    .insert(featureFlag)
    .values(
      input.map((data) => {
        const name =
          data.name ?? `test-${faker.helpers.slugify(faker.animal.bird()).toLowerCase()}`;
        const defaultValue = data.defaultValue ?? { enabled: true };
        const archivedAt = data.archived ? new Date(Date.now() - 1_000) : null;

        return {
          id: uuidv7(),
          organizationId: data.organizationId,
          name,
          defaultValue,
          archivedAt,
        };
      }),
    )
    .returning();
}

type SetTestFeatureFlagValuesInput = {
  organizationId: string;
  featureFlagId: string;
  values: {
    environmentId: string;
    value: FeatureFlagValue | undefined;
  }[];
};

export async function setTestFeatureFlagValues(
  tx: Tx,
  { organizationId, featureFlagId, values }: SetTestFeatureFlagValuesInput,
): Promise<void> {
  for (const { environmentId, value } of values) {
    if (value === undefined) {
      await tx
        .delete(featureFlagValue)
        .where(
          and(
            eq(featureFlagValue.organizationId, organizationId),
            eq(featureFlagValue.featureFlagId, featureFlagId),
            eq(featureFlagValue.environmentId, environmentId),
          ),
        );
      continue;
    }

    await tx
      .insert(featureFlagValue)
      .values({
        organizationId,
        featureFlagId,
        environmentId,
        value,
      })
      .onConflictDoUpdate({
        target: [
          featureFlagValue.organizationId,
          featureFlagValue.featureFlagId,
          featureFlagValue.environmentId,
        ],
        set: { value, updatedAt: new Date() },
      });
  }
}

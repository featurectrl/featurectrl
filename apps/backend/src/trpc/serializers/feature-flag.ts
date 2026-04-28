import type { InferSelectModel } from "drizzle-orm";
import type { app, FeatureFlagValue, featureFlag, featureFlagValue } from "@/db/schema";
import { type BaseApp, serializeBaseApp } from "./app";

type FeatureFlagRow = InferSelectModel<typeof featureFlag>;
type FeatureFlagValueRow = InferSelectModel<typeof featureFlagValue>;

export type BaseFeatureFlag = Pick<
  InferSelectModel<typeof featureFlag>,
  "id" | "name" | "description" | "createdAt" | "archivedAt"
>;

export type FeatureFlagValueEntry = Pick<
  FeatureFlagValueRow,
  "environmentId" | "value" | "updatedAt"
>;

export type FeatureFlag = BaseFeatureFlag & {
  defaultValue: FeatureFlagValue;
  isUnused: boolean;
  apps: BaseApp[];
  values: FeatureFlagValueEntry[];
};

export function serializeBaseFeatureFlag(row: FeatureFlagRow): BaseFeatureFlag {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt,
    archivedAt: row.archivedAt,
  };
}

export function serializeFeatureFlag(
  row: InferSelectModel<typeof featureFlag> & {
    values: FeatureFlagValueRow[];
    appConnections: { app: InferSelectModel<typeof app> }[];
  },
): FeatureFlag {
  return {
    ...serializeBaseFeatureFlag(row),
    defaultValue: row.defaultValue,
    isUnused: row.appConnections.every(({ app }) => app.archivedAt !== null),
    values: row.values.map(({ environmentId, value, updatedAt }) => ({
      environmentId,
      value,
      updatedAt,
    })),
    apps: row.appConnections.map(({ app }) => serializeBaseApp(app)),
  };
}

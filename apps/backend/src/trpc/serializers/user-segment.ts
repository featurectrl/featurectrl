import type { InferSelectModel } from "drizzle-orm";
import { isUserSegmentUnused } from "@/app/user-segment";
import type { app, featureFlag, userSegment } from "@/db/schema";
import { type BaseApp, serializeBaseApp } from "./app";
import type { BaseFeatureFlag } from "./feature-flag";

export type BaseUserSegment = Pick<
  InferSelectModel<typeof userSegment>,
  "id" | "name" | "createdAt" | "archivedAt"
>;

export type UserSegment = BaseUserSegment & {
  isUnused: boolean;
  apps: BaseApp[];
  featureFlags: BaseFeatureFlag[];
};

export function serializeBaseUserSegment(
  row: InferSelectModel<typeof userSegment>,
): BaseUserSegment {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    archivedAt: row.archivedAt,
  };
}

export function serializeUserSegment(
  row: InferSelectModel<typeof userSegment> & {
    appConnections: {
      app: InferSelectModel<typeof app>;
    }[];
  },
  extras: {
    featureFlags: InferSelectModel<typeof featureFlag>[];
  },
): UserSegment {
  return {
    ...serializeBaseUserSegment(row),
    isUnused: isUserSegmentUnused(row),

    apps: row.appConnections.map((conn) => serializeBaseApp(conn.app)),
    featureFlags: extras.featureFlags.toSorted((a, b) => a.name.localeCompare(b.name)),
  };
}

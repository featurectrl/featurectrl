import type { InferSelectModel } from "drizzle-orm";
import type { app, featureFlag, userSegment } from "@/db/schema";
import { type BaseFeatureFlag, serializeBaseFeatureFlag } from "./feature-flag";
import { type BaseUserSegment, serializeBaseUserSegment } from "./user-segment";

export type BaseApp = Pick<
  InferSelectModel<typeof app>,
  "id" | "name" | "createdAt" | "updatedAt" | "archivedAt"
>;

export type App = BaseApp & {
  featureFlags: BaseFeatureFlag[];
  userSegments: BaseUserSegment[];
};

export function serializeBaseApp(row: InferSelectModel<typeof app>): BaseApp {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt,
  };
}

export function serializeApp(
  row: InferSelectModel<typeof app> & {
    featureFlagConnections: { featureFlag: InferSelectModel<typeof featureFlag> }[];
    userSegmentConnections: { userSegment: InferSelectModel<typeof userSegment> }[];
  },
): App {
  return {
    ...serializeBaseApp(row),
    featureFlags: row.featureFlagConnections.map((c) => serializeBaseFeatureFlag(c.featureFlag)),
    userSegments: row.userSegmentConnections.map((c) => serializeBaseUserSegment(c.userSegment)),
  };
}

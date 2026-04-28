import { relations, sql } from "drizzle-orm";
import {
  jsonb,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import type { FeatureFlagValue } from "./fields/feature-flag-value";
import { organizationFk } from "./fields/organization";

const organizationPredicate = sql`organization_id = current_setting('app.current_organization_id', true)::uuid`;

const organizationPolicy = (name: string) =>
  pgPolicy(name, {
    for: "all",
    to: "public",
    using: organizationPredicate,
    withCheck: organizationPredicate,
  });

export const environment = pgTable(
  "environment",
  {
    id: uuid("id").primaryKey(),
    organizationId: organizationFk(),
    name: text("name").notNull(),
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    archivedAt: timestamp("archived_at"),
  },
  (t) => [
    unique("environment_org_name_unique").on(t.organizationId, t.name),
    organizationPolicy("environment_organization_isolation"),
  ],
).enableRLS();

export const userSegment = pgTable(
  "user_segment",
  {
    id: uuid("id").primaryKey(),
    organizationId: organizationFk(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    archivedAt: timestamp("archived_at"),
  },
  (t) => [
    unique("user_segment_org_name_unique").on(t.organizationId, t.name),
    organizationPolicy("user_segment_organization_isolation"),
  ],
).enableRLS();

export const featureFlag = pgTable(
  "feature_flag",
  {
    id: uuid("id").primaryKey(),
    organizationId: organizationFk(),
    name: text("name").notNull(),
    description: text("description"),
    defaultValue: jsonb("default_value").$type<FeatureFlagValue>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    archivedAt: timestamp("archived_at"),
  },
  (t) => [
    unique("feature_flag_org_name_unique").on(t.organizationId, t.name),
    organizationPolicy("feature_flag_organization_isolation"),
  ],
).enableRLS();

export const featureFlagValue = pgTable(
  "feature_flag_value",
  {
    organizationId: organizationFk(),
    featureFlagId: uuid("feature_flag_id")
      .notNull()
      .references(() => featureFlag.id, { onDelete: "cascade" }),
    environmentId: uuid("environment_id")
      .notNull()
      .references(() => environment.id, { onDelete: "cascade" }),
    value: jsonb("value").$type<FeatureFlagValue>().notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.organizationId, t.featureFlagId, t.environmentId],
    }),
    organizationPolicy("feature_flag_value_organization_isolation"),
  ],
).enableRLS();

export const app = pgTable(
  "app",
  {
    id: uuid("id").primaryKey(),
    organizationId: organizationFk(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    archivedAt: timestamp("archived_at"),
  },
  (t) => [
    unique("app_org_name_unique").on(t.organizationId, t.name),
    organizationPolicy("app_organization_isolation"),
  ],
).enableRLS();

export const appFeatureFlagConnection = pgTable(
  "app_feature_flag_connection",
  {
    appId: uuid("app_id")
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    featureFlagId: uuid("feature_flag_id")
      .notNull()
      .references(() => featureFlag.id, { onDelete: "cascade" }),
    organizationId: organizationFk(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.appId, t.featureFlagId, t.organizationId],
    }),
    organizationPolicy("app_feature_flag_connection_organization_isolation"),
  ],
).enableRLS();

export const appUserSegmentConnection = pgTable(
  "app_user_segment_connection",
  {
    appId: uuid("app_id")
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    organizationId: organizationFk(),
    userSegmentId: uuid("user_segment_id")
      .notNull()
      .references(() => userSegment.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.appId, t.organizationId, t.userSegmentId],
    }),
    organizationPolicy("app_user_segment_connection_organization_isolation"),
  ],
).enableRLS();

export const featureFlagRelations = relations(featureFlag, ({ many }) => ({
  values: many(featureFlagValue),
  appConnections: many(appFeatureFlagConnection),
}));

export const featureFlagValueRelations = relations(featureFlagValue, ({ one }) => ({
  featureFlag: one(featureFlag, {
    fields: [featureFlagValue.featureFlagId],
    references: [featureFlag.id],
  }),
  environment: one(environment, {
    fields: [featureFlagValue.environmentId],
    references: [environment.id],
  }),
}));

export const appRelations = relations(app, ({ many }) => ({
  featureFlagConnections: many(appFeatureFlagConnection),
  userSegmentConnections: many(appUserSegmentConnection),
}));

export const appFeatureFlagConnectionRelations = relations(appFeatureFlagConnection, ({ one }) => ({
  app: one(app, {
    fields: [appFeatureFlagConnection.appId],
    references: [app.id],
  }),
  featureFlag: one(featureFlag, {
    fields: [appFeatureFlagConnection.featureFlagId],
    references: [featureFlag.id],
  }),
}));

export const userSegmentRelations = relations(userSegment, ({ many }) => ({
  appConnections: many(appUserSegmentConnection),
}));

export const appUserSegmentConnectionRelations = relations(appUserSegmentConnection, ({ one }) => ({
  app: one(app, {
    fields: [appUserSegmentConnection.appId],
    references: [app.id],
  }),
  userSegment: one(userSegment, {
    fields: [appUserSegmentConnection.userSegmentId],
    references: [userSegment.id],
  }),
}));

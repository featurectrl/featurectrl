import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";
import {
  app,
  appFeatureFlagConnection,
  environment,
  featureFlag,
  featureFlagValue,
  featureFlagValueSchema,
} from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import {
  type BaseFeatureFlag,
  type FeatureFlag,
  serializeBaseFeatureFlag,
  serializeFeatureFlag,
} from "../serializers";
import { organizationProcedure, router } from "../trpc";

export const featureFlagsRoutes = router({
  list: organizationProcedure
    .input(z.object({ includeArchived: z.boolean().default(false) }).optional())
    .query(
      ({ ctx, input }): Promise<FeatureFlag[]> =>
        ctx.db.transaction(async (tx) => {
          await withActiveOrganization(tx, ctx.activeOrganizationId);

          const rows = await tx.query.featureFlag.findMany({
            where: input?.includeArchived ? undefined : isNull(featureFlag.archivedAt),
            with: {
              values: true,
              appConnections: {
                with: { app: true },
              },
            },
          });
          return rows.map(serializeFeatureFlag);
        }),
    ),

  archive: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    ({ ctx, input }): Promise<BaseFeatureFlag> =>
      ctx.db.transaction(async (tx) => {
        await withActiveOrganization(tx, ctx.activeOrganizationId);

        const [connection] = await tx
          .select({ appId: appFeatureFlagConnection.appId })
          .from(appFeatureFlagConnection)
          .innerJoin(app, eq(app.id, appFeatureFlagConnection.appId))
          .where(and(eq(appFeatureFlagConnection.featureFlagId, input.id), isNull(app.archivedAt)))
          .limit(1);
        if (connection) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Cannot archive feature flag that is used by an app",
          });
        }

        const [row] = await tx
          .update(featureFlag)
          .set({ archivedAt: new Date() })
          .where(and(eq(featureFlag.id, input.id), isNull(featureFlag.archivedAt)))
          .returning();
        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Feature flag not found or already archived",
          });
        }
        return serializeBaseFeatureFlag(row);
      }),
  ),

  restore: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    ({ ctx, input }): Promise<BaseFeatureFlag> =>
      ctx.db.transaction(async (tx) => {
        await withActiveOrganization(tx, ctx.activeOrganizationId);

        const [row] = await tx
          .update(featureFlag)
          .set({ archivedAt: null })
          .where(and(eq(featureFlag.id, input.id), isNotNull(featureFlag.archivedAt)))
          .returning();
        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Feature flag not found or not archived",
          });
        }
        return serializeBaseFeatureFlag(row);
      }),
  ),

  updateValue: organizationProcedure
    .input(
      z.object({
        featureFlagId: z.uuid(),
        environmentId: z.uuid(),
        value: featureFlagValueSchema,
      }),
    )
    .mutation(
      ({ ctx, input }): Promise<FeatureFlag> =>
        ctx.db.transaction(async (tx) => {
          await withActiveOrganization(tx, ctx.activeOrganizationId);

          const flagRow = await tx.query.featureFlag.findFirst({
            where: and(eq(featureFlag.id, input.featureFlagId), isNull(featureFlag.archivedAt)),
          });
          if (!flagRow) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Feature flag not found" });
          }

          const envRow = await tx.query.environment.findFirst({
            where: eq(environment.id, input.environmentId),
          });
          if (!envRow) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Environment not found" });
          }

          await tx
            .insert(featureFlagValue)
            .values({
              organizationId: ctx.activeOrganizationId,
              featureFlagId: input.featureFlagId,
              environmentId: input.environmentId,
              value: input.value,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [
                featureFlagValue.organizationId,
                featureFlagValue.featureFlagId,
                featureFlagValue.environmentId,
              ],
              set: { value: input.value, updatedAt: new Date() },
            });

          const reloaded = await tx.query.featureFlag.findFirst({
            where: eq(featureFlag.id, input.featureFlagId),
            with: {
              values: true,
              appConnections: { with: { app: true } },
            },
          });
          if (!reloaded) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Feature flag not found" });
          }
          return serializeFeatureFlag(reloaded);
        }),
    ),

  resetValue: organizationProcedure
    .input(
      z.object({
        featureFlagId: z.uuid(),
        environmentId: z.uuid(),
      }),
    )
    .mutation(
      ({ ctx, input }): Promise<FeatureFlag> =>
        ctx.db.transaction(async (tx) => {
          await withActiveOrganization(tx, ctx.activeOrganizationId);

          await tx
            .delete(featureFlagValue)
            .where(
              and(
                eq(featureFlagValue.featureFlagId, input.featureFlagId),
                eq(featureFlagValue.environmentId, input.environmentId),
              ),
            );

          const reloaded = await tx.query.featureFlag.findFirst({
            where: eq(featureFlag.id, input.featureFlagId),
            with: {
              values: true,
              appConnections: { with: { app: true } },
            },
          });
          if (!reloaded) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Feature flag not found" });
          }
          return serializeFeatureFlag(reloaded);
        }),
    ),
});

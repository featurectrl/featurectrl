import { TRPCError } from "@trpc/server";
import { and, eq, type InferSelectModel, isNull } from "drizzle-orm";
import { z } from "zod";
import { extractSegmentsFromFeatureFlagValue } from "@/app/feature-flag";
import { app, appUserSegmentConnection, type featureFlag, userSegment } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import {
  type BaseUserSegment,
  serializeBaseUserSegment,
  serializeUserSegment,
  type UserSegment,
} from "../serializers";
import { organizationProcedure, router } from "../trpc";

export const segmentsRoutes = router({
  list: organizationProcedure
    .input(z.object({ includeArchived: z.boolean().default(false) }).optional())
    .query(
      ({ ctx, input }): Promise<UserSegment[]> =>
        ctx.db.transaction(async (tx) => {
          await withActiveOrganization(tx, ctx.activeOrganizationId);

          const flags = await tx.query.featureFlag.findMany({
            with: { values: true },
          });

          const segments = await tx.query.userSegment.findMany({
            where: input?.includeArchived ? undefined : isNull(userSegment.archivedAt),
            with: {
              appConnections: {
                with: { app: true },
              },
            },
          });

          const flagsBySegment = new Map<string, InferSelectModel<typeof featureFlag>[]>();
          for (const flag of flags) {
            const referencedSegments = new Set<string>([
              ...extractSegmentsFromFeatureFlagValue(flag.defaultValue),
              ...flags.flatMap((flag) => {
                return flag.values.flatMap((flagValueRow) => {
                  if (!flagValueRow.value) {
                    return [];
                  }

                  return extractSegmentsFromFeatureFlagValue(flagValueRow.value);
                });
              }),
            ]);

            for (const segmentName of referencedSegments) {
              const flags = flagsBySegment.get(segmentName) ?? [];
              flags.push(flag);
              flagsBySegment.set(segmentName, flags);
            }
          }

          return segments.map((row) => {
            return serializeUserSegment(row, {
              featureFlags: flagsBySegment.get(row.name) ?? [],
            });
          });
        }),
    ),

  archive: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    ({ ctx, input }): Promise<BaseUserSegment> =>
      ctx.db.transaction(async (tx) => {
        await withActiveOrganization(tx, ctx.activeOrganizationId);

        const [connection] = await tx
          .select({ appId: appUserSegmentConnection.appId })
          .from(appUserSegmentConnection)
          .innerJoin(app, eq(app.id, appUserSegmentConnection.appId))
          .where(and(eq(appUserSegmentConnection.userSegmentId, input.id), isNull(app.archivedAt)))
          .limit(1);

        if (connection) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Cannot archive segment that is used by an app",
          });
        }

        const [segment] = await tx
          .update(userSegment)
          .set({ archivedAt: new Date() })
          .where(and(eq(userSegment.id, input.id), isNull(userSegment.archivedAt)))
          .returning();
        if (!segment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Segment not found or already archived",
          });
        }
        return serializeBaseUserSegment(segment);
      }),
  ),
});

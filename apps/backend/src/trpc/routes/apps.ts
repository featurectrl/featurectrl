import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";
import { app } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { type App, type BaseApp, serializeApp, serializeBaseApp } from "../serializers";
import { organizationProcedure, router } from "../trpc";

export const appsRoutes = router({
  list: organizationProcedure
    .input(z.object({ includeArchived: z.boolean().default(false) }).optional())
    .query(
      ({ ctx, input }): Promise<App[]> =>
        ctx.db.transaction(async (tx) => {
          await withActiveOrganization(tx, ctx.activeOrganizationId);
          const rows = await tx.query.app.findMany({
            where: input?.includeArchived ? undefined : isNull(app.archivedAt),
            with: {
              featureFlagConnections: { with: { featureFlag: true } },
              userSegmentConnections: { with: { userSegment: true } },
            },
          });
          return rows.map(serializeApp);
        }),
    ),

  archive: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    ({ ctx, input }): Promise<BaseApp> =>
      ctx.db.transaction(async (tx) => {
        await withActiveOrganization(tx, ctx.activeOrganizationId);
        const [row] = await tx
          .update(app)
          .set({ archivedAt: new Date() })
          .where(and(eq(app.id, input.id), isNull(app.archivedAt)))
          .returning();
        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "App not found or already archived",
          });
        }
        return serializeBaseApp(row);
      }),
  ),

  restore: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    ({ ctx, input }): Promise<BaseApp> =>
      ctx.db.transaction(async (tx) => {
        await withActiveOrganization(tx, ctx.activeOrganizationId);
        const [row] = await tx
          .update(app)
          .set({ archivedAt: null })
          .where(and(eq(app.id, input.id), isNotNull(app.archivedAt)))
          .returning();
        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "App not found or not archived",
          });
        }
        return serializeBaseApp(row);
      }),
  ),
});

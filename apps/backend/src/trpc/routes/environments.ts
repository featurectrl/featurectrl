import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { environment } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { type Environment, serializeEnvironment } from "../serializers";
import { organizationProcedure, router } from "../trpc";

export const environmentsRoutes = router({
  list: organizationProcedure
    .input(z.object({ includeArchived: z.boolean().default(false) }).optional())
    .query(
      ({ ctx, input }): Promise<Environment[]> =>
        ctx.db.transaction(async (tx) => {
          await withActiveOrganization(tx, ctx.activeOrganizationId);
          const rows = await tx.query.environment.findMany({
            where: input?.includeArchived ? undefined : isNull(environment.archivedAt),
          });
          return rows.map(serializeEnvironment);
        }),
    ),

  create: organizationProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        displayName: z.string().min(1).max(100),
      }),
    )
    .mutation(
      ({ ctx, input }): Promise<Environment> =>
        ctx.db.transaction(async (tx) => {
          await withActiveOrganization(tx, ctx.activeOrganizationId);
          const [row] = await tx
            .insert(environment)
            .values({
              id: uuidv7(),
              organizationId: ctx.activeOrganizationId,
              name: input.name,
              displayName: input.displayName,
            })
            .returning();
          return serializeEnvironment(row);
        }),
    ),

  update: organizationProcedure
    .input(
      z.object({
        id: z.uuid(),
        data: z.object({
          displayName: z.string().min(1).max(100).optional(),
        }),
      }),
    )
    .mutation(
      ({ ctx, input }): Promise<Environment> =>
        ctx.db.transaction(async (tx) => {
          await withActiveOrganization(tx, ctx.activeOrganizationId);
          const [row] = await tx
            .update(environment)
            .set({
              ...(input.data.displayName !== undefined && { displayName: input.data.displayName }),
            })
            .where(and(eq(environment.id, input.id), isNull(environment.archivedAt)))
            .returning();

          if (!row) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Environment not found or archived",
            });
          }

          return serializeEnvironment(row);
        }),
    ),

  archive: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    ({ ctx, input }): Promise<Environment> =>
      ctx.db.transaction(async (tx) => {
        await withActiveOrganization(tx, ctx.activeOrganizationId);

        const [row] = await tx
          .update(environment)
          .set({ archivedAt: new Date() })
          .where(and(eq(environment.id, input.id), isNull(environment.archivedAt)))
          .returning();

        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found or already archived",
          });
        }
        return serializeEnvironment(row);
      }),
  ),

  restore: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    ({ ctx, input }): Promise<Environment> =>
      ctx.db.transaction(async (tx) => {
        await withActiveOrganization(tx, ctx.activeOrganizationId);

        const [row] = await tx
          .update(environment)
          .set({ archivedAt: null })
          .where(and(eq(environment.id, input.id), isNotNull(environment.archivedAt)))
          .returning();

        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found or not archived",
          });
        }
        return serializeEnvironment(row);
      }),
  ),

  delete: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    ({ ctx, input }): Promise<Environment> =>
      ctx.db.transaction(async (tx) => {
        await withActiveOrganization(tx, ctx.activeOrganizationId);

        const [row] = await tx
          .delete(environment)
          .where(and(eq(environment.id, input.id), isNotNull(environment.archivedAt)))
          .returning();

        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Environment not found or not archived",
          });
        }
        return serializeEnvironment(row);
      }),
  ),
});

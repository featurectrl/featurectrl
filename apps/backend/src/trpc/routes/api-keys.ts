import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { apiKey } from "@/db/schema";
import { generateSecretKey } from "@/lib/secrets";
import {
  type ApiKey,
  type ApiKeySecrets,
  serializeApiKey,
  serializeApiKeySecrets,
} from "../serializers";
import { organizationProcedure, router } from "../trpc";

export const apiKeysRoutes = router({
  list: organizationProcedure.query(({ ctx }): Promise<ApiKey[]> => {
    return ctx.db.query.apiKey
      .findMany({
        where: eq(apiKey.organizationId, ctx.activeOrganizationId),
      })
      .then((rows) => rows.map(serializeApiKey));
  }),

  create: organizationProcedure
    .input(z.object({ displayName: z.string().min(1).max(100) }))
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<{
        apiKey: ApiKey;
        secrets: ApiKeySecrets;
      }> => {
        const [row] = await ctx.db
          .insert(apiKey)
          .values({
            id: uuidv7(),
            organizationId: ctx.activeOrganizationId,
            displayName: input.displayName,
            publicKey: generateSecretKey("fctrl_pk"),
            privateKey: generateSecretKey("fctrl_sk"),
          })
          .returning();

        return {
          apiKey: serializeApiKey(row),
          secrets: serializeApiKeySecrets(row),
        };
      },
    ),

  update: organizationProcedure
    .input(z.object({ id: z.uuid(), displayName: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }): Promise<ApiKey> => {
      const [row] = await ctx.db
        .update(apiKey)
        .set({ displayName: input.displayName })
        .where(and(eq(apiKey.id, input.id), eq(apiKey.organizationId, ctx.activeOrganizationId)))
        .returning();

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }

      return serializeApiKey(row);
    }),

  regenerate: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      secrets: ApiKeySecrets;
    }> => {
      const [row] = await ctx.db
        .update(apiKey)
        .set({
          publicKey: generateSecretKey("fctrl_pk"),
          privateKey: generateSecretKey("fctrl_sk"),
        })
        .where(and(eq(apiKey.id, input.id), eq(apiKey.organizationId, ctx.activeOrganizationId)))
        .returning();

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }

      return {
        secrets: serializeApiKeySecrets(row),
      };
    },
  ),

  delete: organizationProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }): Promise<ApiKey> => {
      const [row] = await ctx.db
        .delete(apiKey)
        .where(and(eq(apiKey.id, input.id), eq(apiKey.organizationId, ctx.activeOrganizationId)))
        .returning();

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }

      return serializeApiKey(row);
    }),
});

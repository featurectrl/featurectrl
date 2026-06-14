import { TRPCError } from "@trpc/server";
import { addDays, startOfDay } from "date-fns";
import { and, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { apiKey } from "@/db/schema";
import { API_KEY_PREFIX, generateSecretKey, hashSecretKey } from "@/lib/secrets";
import {
  type ApiKey,
  type ApiKeySecret,
  serializeApiKey,
  serializeApiKeySecret,
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
    .input(
      z.object({
        displayName: z.string().min(1).max(100),
        expiresInDays: z.number().min(1).max(365).nullable(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<{
        apiKey: ApiKey;
        secret: ApiKeySecret;
      }> => {
        const key = generateSecretKey(API_KEY_PREFIX);

        const [row] = await ctx.db
          .insert(apiKey)
          .values({
            id: uuidv7(),
            organizationId: ctx.activeOrganizationId,
            displayName: input.displayName,
            hashedKey: hashSecretKey(key),
            expiresAt: input.expiresInDays
              ? addDays(startOfDay(Date.now()), input.expiresInDays)
              : null,
          })
          .returning();

        return {
          apiKey: serializeApiKey(row),
          secret: serializeApiKeySecret(key),
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
      secret: ApiKeySecret;
    }> => {
      const key = generateSecretKey(API_KEY_PREFIX);

      const [row] = await ctx.db
        .update(apiKey)
        .set({ hashedKey: hashSecretKey(key) })
        .where(and(eq(apiKey.id, input.id), eq(apiKey.organizationId, ctx.activeOrganizationId)))
        .returning();

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      }

      return {
        secret: serializeApiKeySecret(key),
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

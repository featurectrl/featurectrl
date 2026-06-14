import { TRPCError } from "@trpc/server";
import { addDays, startOfDay } from "date-fns";
import { and, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { publicKey } from "@/db/schema";
import { generateSecretKey, PUBLIC_KEY_PREFIX } from "@/lib/secrets";
import {
  type PublicKey,
  type PublicKeySecret,
  serializePublicKey,
  serializePublicKeySecret,
} from "../serializers";
import { organizationProcedure, router } from "../trpc";

export const publicKeysRoutes = router({
  list: organizationProcedure.query(({ ctx }): Promise<PublicKey[]> => {
    return ctx.db.query.publicKey
      .findMany({
        where: eq(publicKey.organizationId, ctx.activeOrganizationId),
      })
      .then((rows) => rows.map(serializePublicKey));
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
        publicKey: PublicKey;
        secret: PublicKeySecret;
      }> => {
        const key = generateSecretKey(PUBLIC_KEY_PREFIX);

        const [row] = await ctx.db
          .insert(publicKey)
          .values({
            id: uuidv7(),
            organizationId: ctx.activeOrganizationId,
            displayName: input.displayName,
            key,
            expiresAt: input.expiresInDays
              ? addDays(startOfDay(Date.now()), input.expiresInDays)
              : null,
          })
          .returning();

        return {
          publicKey: serializePublicKey(row),
          secret: serializePublicKeySecret(key),
        };
      },
    ),

  update: organizationProcedure
    .input(z.object({ id: z.uuid(), displayName: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }): Promise<PublicKey> => {
      const [row] = await ctx.db
        .update(publicKey)
        .set({ displayName: input.displayName })
        .where(
          and(eq(publicKey.id, input.id), eq(publicKey.organizationId, ctx.activeOrganizationId)),
        )
        .returning();

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Public key not found" });
      }

      return serializePublicKey(row);
    }),

  regenerate: organizationProcedure.input(z.object({ id: z.uuid() })).mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      secret: PublicKeySecret;
    }> => {
      const key = generateSecretKey(PUBLIC_KEY_PREFIX);

      const [row] = await ctx.db
        .update(publicKey)
        .set({ key })
        .where(
          and(eq(publicKey.id, input.id), eq(publicKey.organizationId, ctx.activeOrganizationId)),
        )
        .returning();

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Public key not found" });
      }

      return {
        secret: serializePublicKeySecret(key),
      };
    },
  ),

  delete: organizationProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }): Promise<PublicKey> => {
      const [row] = await ctx.db
        .delete(publicKey)
        .where(
          and(eq(publicKey.id, input.id), eq(publicKey.organizationId, ctx.activeOrganizationId)),
        )
        .returning();

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Public key not found" });
      }

      return serializePublicKey(row);
    }),
});

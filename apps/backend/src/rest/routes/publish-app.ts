import { and, eq, notInArray, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { db } from "@/db";
import {
  app,
  appFeatureFlagConnection,
  appUserSegmentConnection,
  featureFlag,
  featureFlagValueSchema,
  userSegment,
} from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { authenticateWithPrivateApiKey } from "../auth";
import { RestError } from "../errors";

const bodySchema = z.object({
  app: z.string().min(1),
  flags: z.record(
    z.string().min(1),
    z.object({
      defaultValue: featureFlagValueSchema,
      description: z.string().optional(),
    }),
  ),
  segments: z.array(z.string().min(1)),
});

export const publishAppRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post("/apps/publish", async (req, reply) => {
    const { organizationId } = await authenticateWithPrivateApiKey(req);

    const parsedBody = bodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new RestError(400, `Invalid request body: ${parsedBody.error.message}`);
    }
    const { app: appName, flags, segments } = parsedBody.data;

    const flagNames = Object.keys(flags);
    const segmentNames = [...new Set(segments)];

    const result = await db.transaction(async (tx) => {
      await withActiveOrganization(tx, organizationId);

      const [appRow] = await tx
        .insert(app)
        .values({ id: uuidv7(), organizationId, name: appName })
        .onConflictDoUpdate({
          target: [app.organizationId, app.name],
          set: { updatedAt: sql`now()` },
        })
        .returning();

      const flagRows =
        flagNames.length > 0
          ? await tx
              .insert(featureFlag)
              .values(
                flagNames.map((name) => ({
                  id: uuidv7(),
                  organizationId,
                  name,
                  description: flags[name].description ?? null,
                  defaultValue: flags[name].defaultValue,
                })),
              )
              .onConflictDoUpdate({
                target: [featureFlag.organizationId, featureFlag.name],
                set: {
                  description: sql`excluded.description`,
                },
              })
              .returning()
          : [];

      const segmentRows =
        segmentNames.length > 0
          ? await tx
              .insert(userSegment)
              .values(
                segmentNames.map((name) => ({
                  id: uuidv7(),
                  organizationId,
                  name,
                })),
              )
              .onConflictDoUpdate({
                target: [userSegment.organizationId, userSegment.name],
                set: { name: sql`excluded.name` },
              })
              .returning()
          : [];

      const flagIds = flagRows.map((f) => f.id);
      const segmentIds = segmentRows.map((s) => s.id);

      if (flagIds.length > 0) {
        await tx
          .insert(appFeatureFlagConnection)
          .values(
            flagIds.map((featureFlagId) => ({
              appId: appRow.id,
              featureFlagId,
              organizationId,
            })),
          )
          .onConflictDoNothing();

        await tx
          .delete(appFeatureFlagConnection)
          .where(
            and(
              eq(appFeatureFlagConnection.appId, appRow.id),
              notInArray(appFeatureFlagConnection.featureFlagId, flagIds),
            ),
          );
      } else {
        await tx
          .delete(appFeatureFlagConnection)
          .where(eq(appFeatureFlagConnection.appId, appRow.id));
      }

      if (segmentIds.length > 0) {
        await tx
          .insert(appUserSegmentConnection)
          .values(
            segmentIds.map((userSegmentId) => ({
              appId: appRow.id,
              userSegmentId,
              organizationId,
            })),
          )
          .onConflictDoNothing();

        await tx
          .delete(appUserSegmentConnection)
          .where(
            and(
              eq(appUserSegmentConnection.appId, appRow.id),
              notInArray(appUserSegmentConnection.userSegmentId, segmentIds),
            ),
          );
      } else {
        await tx
          .delete(appUserSegmentConnection)
          .where(eq(appUserSegmentConnection.appId, appRow.id));
      }

      return {
        app: { id: appRow.id, name: appRow.name },
        flags: flagRows.map((f) => ({ id: f.id, name: f.name })),
        segments: segmentRows.map((s) => ({ id: s.id, name: s.name })),
      };
    });

    reply.send({ ok: true, ...result });
  });
};

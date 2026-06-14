import { isNull } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "@/db";
import { userSegment } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { authenticateWithPrivateApiKey } from "../auth";
import { paginated } from "../pagination";

const paramsSchema = z.object({
  orgSlug: z.string().min(1),
});

export const listSegmentsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/:orgSlug/segments", async (req, reply) => {
    const { orgSlug } = paramsSchema.parse(req.params);
    const { organizationId } = await authenticateWithPrivateApiKey(req, orgSlug);

    const items = await db.transaction(async (tx) => {
      await withActiveOrganization(tx, organizationId);

      return tx
        .select({
          id: userSegment.id,
          name: userSegment.name,
          createdAt: userSegment.createdAt,
        })
        .from(userSegment)
        .where(isNull(userSegment.archivedAt))
        .orderBy(userSegment.name);
    });

    reply.send(paginated(items));
  });
};

import { isNull } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { db } from "@/db";
import { userSegment } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { authenticateWithPrivateApiKey } from "../auth";
import { paginated } from "../pagination";

export const listSegmentsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/segments", async (req, reply) => {
    const { organizationId } = await authenticateWithPrivateApiKey(req);

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

import { isNull } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { db } from "@/db";
import { featureFlag } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { authenticateWithPrivateApiKey } from "../auth";
import { paginated } from "../pagination";

export const listFlagsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/flags", async (req, reply) => {
    const { organizationId } = await authenticateWithPrivateApiKey(req);

    const items = await db.transaction(async (tx) => {
      await withActiveOrganization(tx, organizationId);

      return tx
        .select({
          id: featureFlag.id,
          name: featureFlag.name,
          description: featureFlag.description,
          defaultValue: featureFlag.defaultValue,
          createdAt: featureFlag.createdAt,
        })
        .from(featureFlag)
        .where(isNull(featureFlag.archivedAt))
        .orderBy(featureFlag.name);
    });

    reply.send(paginated(items));
  });
};

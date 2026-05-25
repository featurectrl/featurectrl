import { isNull } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { db } from "@/db";
import { app } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { authenticateWithPrivateApiKey } from "../auth";
import { paginated } from "../pagination";

export const listAppsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/apps", async (req, reply) => {
    const { organizationId } = await authenticateWithPrivateApiKey(req);

    const items = await db.transaction(async (tx) => {
      await withActiveOrganization(tx, organizationId);

      return tx
        .select({
          id: app.id,
          name: app.name,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
        })
        .from(app)
        .where(isNull(app.archivedAt))
        .orderBy(app.name);
    });

    reply.send(paginated(items));
  });
};

import { and, eq, isNull, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "@/db";
import { environment, type FeatureFlagValue, featureFlag, featureFlagValue } from "@/db/schema";
import { withActiveOrganization } from "@/db/with-active-organization";
import { authenticateWithPublicApiKey } from "../../auth";
import { RestError } from "../../errors";

const paramsSchema = z.object({
  orgSlug: z.string().min(1),
  environmentName: z.string().min(1),
});

export const publicEnvironmentRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/:orgSlug/public/flags/:environmentName", async (req, reply) => {
    const { orgSlug, environmentName } = paramsSchema.parse(req.params);
    const { organizationId } = await authenticateWithPublicApiKey(req, orgSlug);

    const result = await db.transaction(async (tx) => {
      await withActiveOrganization(tx, organizationId);

      const [env] = await tx
        .select({ id: environment.id })
        .from(environment)
        .where(
          and(
            eq(environment.organizationId, organizationId),
            eq(environment.name, environmentName),
            isNull(environment.archivedAt),
          ),
        )
        .limit(1);

      if (!env) {
        throw new RestError(404, `Environment "${environmentName}" not found`);
      }

      const rows = await tx
        .select({
          name: featureFlag.name,
          value: sql<FeatureFlagValue>`COALESCE(${featureFlagValue.value}, ${featureFlag.defaultValue})`,
        })
        .from(featureFlag)
        .leftJoin(
          featureFlagValue,
          and(
            eq(featureFlagValue.featureFlagId, featureFlag.id),
            eq(featureFlagValue.environmentId, env.id),
          ),
        )
        .where(isNull(featureFlag.archivedAt));

      return { featureFlags: rows };
    });

    reply.send(result);
  });
};

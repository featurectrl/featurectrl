import type { FastifyPluginAsync } from "fastify";
import { RestError } from "./errors";
import { listAppsRoute } from "./routes/apps-list";
import { publishAppRoute } from "./routes/apps-publish";
import { listFlagsRoute } from "./routes/flags-list";
import { publicEnvironmentRoute } from "./routes/public/flags";
import { listSegmentsRoute } from "./routes/segments-list";

export const restPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, _req, reply) => {
    if (error instanceof RestError) {
      reply.status(error.statusCode).send({ error: error.message });
      return;
    }
    fastify.log.error(error);
    reply.status(500).send({ error: "Internal Server Error" });
  });

  await fastify.register(publishAppRoute);
  await fastify.register(listAppsRoute);
  await fastify.register(listFlagsRoute);
  await fastify.register(listSegmentsRoute);
  await fastify.register(publicEnvironmentRoute);
};

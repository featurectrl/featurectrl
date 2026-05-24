import type { FastifyPluginAsync } from "fastify";
import { RestError } from "./errors";
import { publicEnvironmentRoute } from "./routes/public-environment";
import { publishAppRoute } from "./routes/publish-app";

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
  await fastify.register(publicEnvironmentRoute);
};

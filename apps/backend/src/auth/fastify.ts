import { fromNodeHeaders } from "better-auth/node";
import type { FastifyPluginAsync } from "fastify";
import { auth } from "./client";

export const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: ["GET", "POST"],
    url: "/*",
    async handler(req, reply) {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const headers = fromNodeHeaders(req.headers);

      const request = new Request(url.toString(), {
        method: req.method,
        headers,
        ...(req.body ? { body: JSON.stringify(req.body) } : {}),
      });

      const response = await auth.handler(request);
      reply.status(response.status);
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });
      reply.send(response.body ? await response.text() : null);
    },
  });
};

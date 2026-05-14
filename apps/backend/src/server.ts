import { readFileSync } from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { env } from "@/env";
import { mount } from "@/lib/fastify";
import { authPlugin } from "./auth/fastify";
import { restPlugin } from "./rest/fastify";
import { trpcPlugin } from "./trpc/fastify";

export const fastify = Fastify({
  routerOptions: { maxParamLength: 5000 },
});

await fastify.register(cors, {
  origin: [env.ORIGIN],
  credentials: true,
});

if (env.DEBUG_SLOW_MODE) {
  fastify.addHook("onRequest", async () => {
    await sleep(1_000);
  });
}

fastify.register(mount(path.join(env.BFF_API_ORIGIN, "auth"), authPlugin));
fastify.register(mount(path.join(env.BFF_API_ORIGIN, "trpc"), trpcPlugin));
fastify.register(mount(env.REST_API_ORIGIN, restPlugin));

if (env.STANDALONE) {
  const publicDir = path.resolve(process.cwd(), "public");
  const indexHtml = readFileSync(path.join(publicDir, "index.html"));

  const bffPrefix = new URL(env.BFF_API_ORIGIN).pathname;
  const restPrefix = new URL(env.REST_API_ORIGIN).pathname;

  await fastify.register(fastifyStatic, { root: publicDir, wildcard: false });

  fastify.setNotFoundHandler((req, reply) => {
    const url = req.raw.url ?? "/";
    if (url.startsWith(bffPrefix) || url.startsWith(restPrefix)) {
      return reply.status(404).send({ error: "Not Found" });
    }
    return reply.type("text/html").send(indexHtml);
  });
}

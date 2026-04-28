import { env } from "@/env";
import { fastify } from "@/server";

try {
  const host = env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
  const port = env.BACKEND_PORT;

  console.log(`Listening at http://${host}:${port}...`);
  await fastify.listen({ host, port });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

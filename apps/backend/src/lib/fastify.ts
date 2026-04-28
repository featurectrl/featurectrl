import type { FastifyPluginAsync } from "fastify";

export function mount(origin: string, plugin: FastifyPluginAsync): FastifyPluginAsync {
  const originUrl = new URL(origin);

  return async (fastify) => {
    if (originUrl.host) {
      fastify.addHook("onRoute", (route) => {
        route.constraints = { ...route.constraints, host: originUrl.host };
      });
    }

    await fastify.register(plugin, { prefix: originUrl.pathname });
  };
}

import { createRouter } from "@tanstack/react-router";
import { betterAuth, betterAuthClient } from "@/lib/auth.ts";
import { queryClient } from "@/lib/react-query.ts";
import { trpc } from "@/lib/trpc.ts";
import { routeTree } from "@/routeTree.gen.ts";

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingMinMs: 300,
  defaultPendingMs: 100,
  context: {
    queryClient,
    trpc,
    betterAuth,
    betterAuthClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

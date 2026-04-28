import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { SlotProvider } from "@/components/slot.tsx";
import type { betterAuth, betterAuthClient } from "@/lib/auth.ts";
import type { trpc } from "@/lib/trpc.ts";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  trpc: typeof trpc;
  betterAuth: typeof betterAuth;
  betterAuthClient: typeof betterAuthClient;
}>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <SlotProvider>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </SlotProvider>
  );
}

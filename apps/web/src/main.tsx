import { matchQuery, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BetterAuthProvider, betterAuth } from "@/lib/auth";
import { withPersistentLastSession } from "@/lib/persistent-last-session.ts";
import { queryClient } from "@/lib/react-query";
import { TRPCProvider, trpc } from "@/lib/trpc";
import { router } from "@/router";
import { Toaster } from "@/ui/sonner";
import { TooltipProvider } from "@/ui/tooltip";
import "./style.css";
import { DAY, MINUTE } from "@/lib/time.ts";

queryClient.setDefaultOptions({
  queries: {
    staleTime: (query) => {
      if (
        matchQuery({ queryKey: betterAuth.getSession.queryKey() }, query) ||
        matchQuery({ queryKey: trpc.settings.get.queryKey() }, query)
      ) {
        return 3600_000; // 1 hour
      }

      return 2_500;
    },
  },
});

withPersistentLastSession({
  queryClient,
  betterAuth,
  autoSaveInterval: 2 * MINUTE,
  storage: localStorage,
  storageKey: "__featurectrl:last-session",
  storageKeyExpiryTime: DAY,
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root element not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TRPCProvider value={trpc}>
        <BetterAuthProvider value={betterAuth}>
          <TooltipProvider delay={300} closeDelay={100}>
            <RouterProvider router={router} />
            <Toaster />
          </TooltipProvider>
        </BetterAuthProvider>
      </TRPCProvider>
    </QueryClientProvider>
  </StrictMode>,
);

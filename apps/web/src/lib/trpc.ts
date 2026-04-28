import type { AppRouter } from "@featurectrl/backend/types/trpc";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { createContext, useContext } from "react";
import superjson from "superjson";
import { TRPC_API_URL } from "@/lib/bff";
import { queryClient } from "@/lib/react-query.ts";

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: TRPC_API_URL,
      transformer: superjson,
      fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

const Context = createContext<typeof trpc | undefined>(undefined);

export const TRPCProvider = Context.Provider;

export function useTRPC() {
  const trpc = useContext(Context);
  if (!trpc) {
    throw new Error("Missing <TRPCProvider/>");
  }

  return trpc;
}

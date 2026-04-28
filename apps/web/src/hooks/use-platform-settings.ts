import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc.ts";

export function usePlatformSettings() {
  const trpc = useTRPC();

  return useQuery(trpc.settings.get.queryOptions());
}

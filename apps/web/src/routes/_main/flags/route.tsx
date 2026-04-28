import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { inferOutput } from "@trpc/tanstack-react-query";
import { useMemo, useState } from "react";
import { AppTopbar } from "@/components/app-topbar.tsx";
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { useTRPC } from "@/lib/trpc.ts";
import { Card } from "@/ui/card.tsx";
import { FlagsEmpty } from "./_components/flags-empty.tsx";
import { FlagsTable, FlagsTableSkeleton } from "./_components/flags-table.tsx";
import { FlagsTopbar } from "./_components/flags-topbar.tsx";
import { SetFlagValueCommand } from "./_components/set-flag-value-command/set-flag-value-command.tsx";

type FeatureFlag = inferOutput<ReturnType<typeof useTRPC>["featureFlags"]["list"]>[number];
type FlagValue = FeatureFlag["values"][number]["value"];

export const Route = createFileRoute("/_main/flags")({
  staticData: { crumb: "Feature flags" },
  loader: async ({ context }) => {
    const { queryClient, trpc } = context;

    await Promise.all([
      queryClient.ensureQueryData(trpc.featureFlags.list.queryOptions()),
      queryClient.ensureQueryData(trpc.environments.list.queryOptions()),
    ]);
    void queryClient.ensureQueryData(trpc.segments.list.queryOptions());
  },
  pendingComponent: FlagsPageLoading,
  component: FlagsPage,
});

function PageHeader() {
  return (
    <header className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Feature flags</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Flags are submitted from your codebase. Toggle them per environment, optionally targeting
          segments.
        </p>
      </div>
    </header>
  );
}

function FlagsPageLoading() {
  return (
    <div className="px-6 py-6">
      <PageHeader />

      <Card className="gap-0 py-0">
        <FlagsTableSkeleton />
      </Card>
    </div>
  );
}

function FlagsPage() {
  const trpc = useTRPC();

  const [{ data: flags }, { data: environments }, { data: apps }] = useSuspenseQueries({
    queries: [
      trpc.featureFlags.list.queryOptions(),
      trpc.environments.list.queryOptions(),
      trpc.apps.list.queryOptions(),
    ],
  });

  const [query, setQuery] = useState("");
  const [appId, setAppId] = useState<string | null>(null);

  const editDialogHandle = useDialogHandle<{
    flag: FeatureFlag;
    environmentId: string;
    value: FlagValue | undefined;
  }>();

  const filtered = useMemo(
    () =>
      flags.filter(
        (f) =>
          (query === "" || f.name.includes(query)) &&
          (appId === null || f.apps.some((a) => a.id === appId)),
      ),
    [flags, query, appId],
  );

  const isEmpty = flags.length === 0;

  return (
    <div className="px-6 py-6">
      <AppTopbar.RightArea.Content>
        <FlagsTopbar
          query={query}
          onQueryChange={setQuery}
          apps={apps}
          appId={appId}
          onAppIdChange={setAppId}
        />
      </AppTopbar.RightArea.Content>

      <PageHeader />

      {isEmpty ? (
        <FlagsEmpty />
      ) : (
        <Card className="gap-0 py-0">
          <FlagsTable
            flags={filtered}
            environments={environments}
            emptyText="No flags match your search."
            onEdit={(flag, environmentId, value) =>
              editDialogHandle.openWithPayload({ flag, environmentId, value })
            }
          />
        </Card>
      )}

      <SetFlagValueCommand handle={editDialogHandle} />
    </div>
  );
}

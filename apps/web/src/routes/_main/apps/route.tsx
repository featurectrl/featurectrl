import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { inferOutput } from "@trpc/tanstack-react-query";
import { useEffect } from "react";
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { useTRPC } from "@/lib/trpc.ts";
import { AppDetailsDialog } from "@/routes/_main/apps/_components/app-details-dialog.tsx";
import { ArchiveAppDialog } from "@/routes/_main/apps/_components/archive-app-dialog.tsx";
import { Card } from "@/ui/card.tsx";
import { JsonCode } from "@/ui/json-code.tsx";
import { AppsEmpty } from "./_components/apps-empty";
import { AppsTable, AppsTableSkeleton } from "./_components/apps-table";

type App = inferOutput<ReturnType<typeof useTRPC>["apps"]["list"]>[number];

export const Route = createFileRoute("/_main/apps")({
  staticData: { crumb: "Apps" },
  loader: async ({ context }) => {
    const { queryClient, trpc } = context;
    await queryClient.ensureQueryData(trpc.apps.list.queryOptions());
  },
  pendingComponent: AppsPageLoading,
  component: AppsPage,
});

function PageHeader() {
  return (
    <header className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Apps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Apps are reported from your codebase. Each app tracks the flags and segments it uses.
        </p>
      </div>
    </header>
  );
}

function AppsPageLoading() {
  return (
    <div className="px-6 py-6">
      <PageHeader />

      <Card className="gap-0 py-0">
        <AppsTableSkeleton />
      </Card>
    </div>
  );
}

function AppsPage() {
  const trpc = useTRPC();

  const { data: apps } = useSuspenseQuery(trpc.apps.list.queryOptions());

  const detailsDialogHandle = useDialogHandle<{ app: App }>();
  const archiveDialogHandle = useDialogHandle<{ app: App }>();

  useEffect(() => {
    JsonCode.preload();
  }, []);

  const isEmpty = apps.length === 0;

  return (
    <div className="px-6 py-6">
      <PageHeader />

      {isEmpty ? (
        <AppsEmpty />
      ) : (
        <Card className="gap-0 py-0">
          <AppsTable
            apps={apps}
            onDetails={(app) => detailsDialogHandle.openWithPayload({ app })}
            onArchive={(app) => archiveDialogHandle.openWithPayload({ app })}
          />
        </Card>
      )}

      <AppDetailsDialog handle={detailsDialogHandle} />
      <ArchiveAppDialog handle={archiveDialogHandle} />
    </div>
  );
}

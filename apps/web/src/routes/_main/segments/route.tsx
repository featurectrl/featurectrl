import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { inferOutput } from "@trpc/tanstack-react-query";
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { useTRPC } from "@/lib/trpc.ts";
import { Card } from "@/ui/card.tsx";
import { ArchiveSegmentDialog } from "./_components/archive-segment-dialog.tsx";
import { SegmentsEmpty } from "./_components/segments-empty.tsx";
import { SegmentsTable, SegmentsTableSkeleton } from "./_components/segments-table.tsx";

type Segment = inferOutput<ReturnType<typeof useTRPC>["segments"]["list"]>[number];

export const Route = createFileRoute("/_main/segments")({
  staticData: { crumb: "Segments" },
  loader: async ({ context }) => {
    const { queryClient, trpc } = context;
    await queryClient.ensureQueryData(trpc.segments.list.queryOptions());
  },
  pendingComponent: SegmentsPageLoading,
  component: SegmentsPage,
});

function PageHeader() {
  return (
    <header className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Segments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Segments group your users so you can target them from feature flag values.
        </p>
      </div>
    </header>
  );
}

function SegmentsPageLoading() {
  return (
    <div className="px-6 py-6">
      <PageHeader />

      <Card className="gap-0 py-0">
        <SegmentsTableSkeleton />
      </Card>
    </div>
  );
}

function SegmentsPage() {
  const trpc = useTRPC();

  const { data: segments } = useSuspenseQuery(trpc.segments.list.queryOptions());

  const archiveDialogHandle = useDialogHandle<{ segment: Segment }>();

  const isEmpty = segments.length === 0;

  return (
    <div className="px-6 py-6">
      <PageHeader />

      {isEmpty ? (
        <SegmentsEmpty />
      ) : (
        <Card className="gap-0 py-0">
          <SegmentsTable
            segments={segments}
            onArchive={(segment) => archiveDialogHandle.openWithPayload({ segment })}
          />
        </Card>
      )}

      <ArchiveSegmentDialog handle={archiveDialogHandle} />
    </div>
  );
}

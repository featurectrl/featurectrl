import type { App } from "@/lib/trpc.types";
import { range } from "@/lib/utils.ts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table.tsx";
import { AppsTableRow, AppsTableRowSkeleton } from "./apps-table-row.tsx";

interface AppsTableProps {
  apps: readonly App[];
  emptyText?: string;

  onDetails: (app: App) => void;
  onArchive: (app: App) => void;
}

export function AppsTable({ apps, emptyText, onDetails, onArchive }: AppsTableProps) {
  return (
    <Table>
      <AppsTableHeader />

      <TableBody>
        {apps.length === 0 && emptyText ? (
          <TableRow>
            <TableCell colSpan={3} className="px-4 py-4 text-center text-xs text-muted-foreground">
              {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          apps.map((app) => (
            <AppsTableRow
              key={app.id}
              app={app}
              onDetails={() => onDetails(app)}
              onArchive={() => onArchive(app)}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}

interface AppsTableSkeletonProps {
  className?: string;
}

export function AppsTableSkeleton({ className }: AppsTableSkeletonProps) {
  return (
    <Table className={className}>
      <AppsTableHeader />
      <TableBody>
        {range(3).map((idx) => (
          <AppsTableRowSkeleton key={`apps-table-row-skeleton-${idx}`} />
        ))}
      </TableBody>
    </Table>
  );
}

function AppsTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="px-4 text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
          App
        </TableHead>
        <TableHead className="px-4 w-32 text-xxs font-semibold uppercase tracking-wider text-muted-foreground text-right">
          Last updated
        </TableHead>
        <TableHead className="px-4 w-10" />
      </TableRow>
    </TableHeader>
  );
}

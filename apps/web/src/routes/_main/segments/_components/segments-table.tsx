import type { UserSegment } from "@/lib/trpc.types";
import { range } from "@/lib/utils.ts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table.tsx";
import { SegmentsTableRow, SegmentsTableRowSkeleton } from "./segments-table-row.tsx";

interface SegmentsTableProps {
  segments: readonly UserSegment[];
  emptyText?: string;

  onArchive: (segment: UserSegment) => void;
}

export function SegmentsTable({ segments, emptyText, onArchive }: SegmentsTableProps) {
  return (
    <Table>
      <SegmentsTableHeader />
      <TableBody>
        {segments.length === 0 && emptyText ? (
          <TableRow>
            <TableCell colSpan={2} className="px-4 py-4 text-center text-xs text-muted-foreground">
              {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          segments.map((segment) => (
            <SegmentsTableRow
              key={segment.id}
              segment={segment}
              onArchive={() => onArchive(segment)}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}

interface SegmentsTableSkeletonProps {
  className?: string;
}

export function SegmentsTableSkeleton({ className }: SegmentsTableSkeletonProps) {
  return (
    <Table className={className}>
      <SegmentsTableHeader />
      <TableBody>
        {range(3).map((idx) => (
          <SegmentsTableRowSkeleton key={`segments-table-row-skeleton-${idx}`} />
        ))}
      </TableBody>
    </Table>
  );
}

function SegmentsTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="px-4 text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
          Segment
        </TableHead>
        <TableHead className="w-10 px-4">
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

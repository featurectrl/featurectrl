import type { Environment, FeatureFlag } from "@/lib/trpc.types";
import { range } from "@/lib/utils.ts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table.tsx";
import { FlagsTableRow, FlagsTableRowSkeleton } from "./flags-table-row.tsx";

type FlagValue = FeatureFlag["values"][number]["value"];

interface FlagsTableProps {
  flags: readonly FeatureFlag[];
  environments: readonly Environment[];
  emptyText?: string;

  onEdit: (flag: FeatureFlag, environmentId: string, value: FlagValue | undefined) => void;
}

export function FlagsTable({ flags, environments, emptyText, onEdit }: FlagsTableProps) {
  return (
    <Table>
      <FlagsTableHeader environments={environments} />
      <TableBody>
        {flags.length === 0 && emptyText ? (
          <TableRow>
            <TableCell
              colSpan={environments.length + 1}
              className="px-4 py-4 text-center text-xs text-muted-foreground"
            >
              {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          flags.map((flag) => (
            <FlagsTableRow
              key={flag.id}
              flag={flag}
              environments={environments}
              onEdit={(environmentId, value) => onEdit(flag, environmentId, value)}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}

interface FlagsTableSkeletonProps {
  className?: string;
}

const SKELETON_ENV_COUNT = 3;

export function FlagsTableSkeleton({ className }: FlagsTableSkeletonProps) {
  return (
    <Table className={className}>
      <FlagsTableSkeletonHeader />
      <TableBody>
        {range(3).map((idx) => (
          <FlagsTableRowSkeleton
            key={`flags-table-row-skeleton-${idx}`}
            envCount={SKELETON_ENV_COUNT}
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface FlagsTableHeaderProps {
  environments: readonly Pick<Environment, "id" | "name">[];
}

function FlagsTableHeader({ environments }: FlagsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="px-4 text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
          Flag key
        </TableHead>
        {environments.map((env) => (
          <TableHead
            key={env.id}
            className="px-4 w-1/6 text-xxs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {env.name}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

function FlagsTableSkeletonHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="px-4 text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
          Flag key
        </TableHead>
        {range(SKELETON_ENV_COUNT).map((idx) => (
          <TableHead
            key={`skeleton-env-${idx}`}
            className="px-4 w-1/6 text-xxs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            &nbsp;
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

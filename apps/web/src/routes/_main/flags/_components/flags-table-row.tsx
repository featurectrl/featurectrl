import { useMemo } from "react";
import type { Environment, FeatureFlag } from "@/lib/trpc.types";
import { range } from "@/lib/utils.ts";
import { Skeleton } from "@/ui/skeleton.tsx";
import { TableCell, TableRow } from "@/ui/table.tsx";
import { FlagsTableValueCell } from "./flags-table-value-cell.tsx";

type FlagValue = FeatureFlag["values"][number]["value"];

interface FlagsTableRowProps {
  flag: FeatureFlag;
  environments: readonly Environment[];
  onEdit: (environmentId: string, value: FlagValue | undefined) => void;
}

export function FlagsTableRow({ flag, environments, onEdit }: FlagsTableRowProps) {
  const values = useMemo(
    () => new Map<string, FlagValue>(flag.values.map((v) => [v.environmentId, v.value])),
    [flag.values],
  );

  return (
    <TableRow>
      <TableCell className="px-4 py-2.5">
        <span className="inline-flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-foreground">{flag.name}</span>
          {flag.isUnused && (
            <span className="rounded-md border px-1.5 py-0.5 text-xxs font-medium uppercase tracking-wide text-muted-foreground">
              Unused
            </span>
          )}
        </span>
      </TableCell>
      {environments.map((env) => {
        const value = values.get(env.id) ?? flag.defaultValue;
        return (
          <TableCell key={env.id} className="px-4 py-2.5">
            <FlagsTableValueCell flag={flag} value={value} onEdit={() => onEdit(env.id, value)} />
          </TableCell>
        );
      })}
    </TableRow>
  );
}

interface FlagsTableRowSkeletonProps {
  envCount: number;
}

export function FlagsTableRowSkeleton({ envCount }: FlagsTableRowSkeletonProps) {
  return (
    <TableRow>
      <TableCell className="px-4 py-2.5">
        <Skeleton className="h-4 w-48" />
      </TableCell>
      {range(envCount).map((idx) => (
        <TableCell key={`env-${idx}`} className="px-4 py-2.5">
          <Skeleton className="h-4 w-16" />
        </TableCell>
      ))}
    </TableRow>
  );
}

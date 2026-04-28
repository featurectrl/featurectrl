import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import type { UserSegment } from "@/lib/trpc.types";
import { Button } from "@/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";
import { TableCell, TableRow } from "@/ui/table.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip.tsx";

interface SegmentsTableRowProps {
  segment: UserSegment;
  onArchive: () => void;
}

export function SegmentsTableRow({ segment, onArchive }: SegmentsTableRowProps) {
  return (
    <TableRow>
      <TableCell className="px-4 py-2.5">
        <span className="inline-flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{segment.name}</span>
          {segment.isUnused && (
            <span className="rounded-md border px-1.5 py-0.5 text-xxs font-medium uppercase tracking-wide text-muted-foreground">
              Unused
            </span>
          )}
        </span>
      </TableCell>
      <TableCell className="w-10 px-4 py-2.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreVerticalIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <Tooltip>
              <TooltipTrigger render={<span />} disabled={segment.isUnused}>
                <DropdownMenuItem
                  disabled={!segment.isUnused}
                  variant="destructive"
                  onClick={onArchive}
                >
                  <TrashIcon /> Archive
                </DropdownMenuItem>
              </TooltipTrigger>

              <TooltipContent sideOffset={16} side="left">
                {segment.isUnused ? "App is unused" : "Segment is used by apps"}
              </TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function SegmentsTableRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="px-4 py-2.5">
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell className="w-10 px-4 py-2.5 text-right">
        <Button variant="ghost" size="icon-sm" disabled>
          <MoreVerticalIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}

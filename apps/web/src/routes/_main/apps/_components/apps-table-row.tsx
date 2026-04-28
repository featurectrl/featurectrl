import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import type { App } from "@/lib/trpc.types";
import { stopPropagation } from "@/lib/utils.ts";
import { Button } from "@/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";
import { TableCell, TableRow } from "@/ui/table.tsx";

interface AppsTableRowProps {
  app: App;

  onArchive: () => void;
  onDetails: () => void;
}

export function AppsTableRow({ app, onDetails, onArchive }: AppsTableRowProps) {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/40" onClick={onDetails}>
      <TableCell className="px-4 py-2.5">
        <span className="text-xs font-medium text-foreground">{app.name}</span>
      </TableCell>
      <TableCell className="px-4 py-2.5 text-xs text-muted-foreground text-right">
        {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}
      </TableCell>
      <TableCell className="px-4 py-2.5 w-10 text-right" onClick={stopPropagation}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreVerticalIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onClick={onArchive}>
              <TrashIcon /> Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function AppsTableRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="px-4 py-2.5">
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell className="px-4 py-2.5">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="px-4 py-2.5 w-10 text-right">
        <Button variant="ghost" size="icon-sm" disabled>
          <MoreVerticalIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
}

import { ArchiveRestoreIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { WidgetListItem } from "@/components/widget.tsx";
import type { Environment } from "@/lib/trpc.types";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";

interface EnvironmentRowProps {
  environment: Environment;

  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

export function EnvironmentRow({
  environment,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: EnvironmentRowProps) {
  const archived = environment.archivedAt != null;

  return (
    <WidgetListItem className={cn(archived && "opacity-60")}>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{environment.displayName}</span>
          {archived && (
            <span className="rounded-md border px-1.5 py-0.5 text-xxs font-medium uppercase tracking-wide text-muted-foreground">
              Archived
            </span>
          )}
        </span>
        <span className="truncate font-mono text-xs text-muted-foreground">{environment.name}</span>
      </div>

      {archived ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreVerticalIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRestore}>
              <ArchiveRestoreIcon /> Restore
            </DropdownMenuItem>

            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <TrashIcon /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreVerticalIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <PencilIcon /> Edit
            </DropdownMenuItem>

            <DropdownMenuItem variant="destructive" onClick={onArchive}>
              <TrashIcon /> Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </WidgetListItem>
  );
}

export function EnvironmentRowSkeleton() {
  return (
    <WidgetListItem>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton className="h-4 w-full max-w-32" />
        <Skeleton className="h-4 w-full max-w-24" />
      </div>
    </WidgetListItem>
  );
}

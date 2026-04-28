import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import {
  LogOutIcon,
  MonitorIcon,
  MoreVerticalIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react";
import { WidgetListItem } from "@/components/widget.tsx";
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { parseUserAgent } from "@/lib/parse-user-agent.ts";
import { Button } from "@/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";
import { RevokeSessionDialog } from "./revoke-session-dialog.tsx";

export interface SessionItem {
  id: string;
  token: string;
  ipAddress: string | null | undefined;
  userAgent: string | null | undefined;
  updatedAt: Date | string;
  createdAt: Date | string;
}

interface SessionRowProps {
  session: SessionItem;
  isCurrent: boolean;
}

export function SessionRow({ session, isCurrent }: SessionRowProps) {
  const revokeDialogHandle = useDialogHandle();
  const ua = parseUserAgent(session.userAgent ?? null);
  const Icon =
    ua.deviceType === "mobile"
      ? SmartphoneIcon
      : ua.deviceType === "tablet"
        ? TabletIcon
        : MonitorIcon;

  const lastActive = formatDistanceToNow(new Date(session.updatedAt), {
    addSuffix: true,
  });
  const ip = session.ipAddress?.trim();

  return (
    <WidgetListItem>
      <Icon className="size-4 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 truncate text-sm font-medium">
          {ua.label}
          {isCurrent && (
            <span className="rounded-md border px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
              This device
            </span>
          )}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {[ip, `Last active ${lastActive}`].filter(Boolean).join(" · ")}
        </span>
      </div>
      {!isCurrent && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="More actions">
                  <MoreVerticalIcon />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem variant="destructive" onClick={() => revokeDialogHandle.open(null)}>
                <LogOutIcon /> Revoke session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <RevokeSessionDialog handle={revokeDialogHandle} session={session} />
        </>
      )}
    </WidgetListItem>
  );
}

export function SessionRowSkeleton() {
  return (
    <WidgetListItem>
      <MonitorIcon className="size-4 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Button variant="ghost" size="icon-sm" disabled aria-label="More actions">
        <MoreVerticalIcon />
      </Button>
    </WidgetListItem>
  );
}

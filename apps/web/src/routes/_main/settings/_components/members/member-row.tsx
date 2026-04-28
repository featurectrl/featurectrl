import { MoreVerticalIcon, XIcon } from "lucide-react";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar.tsx";
import { WidgetListItem } from "@/components/widget.tsx";
import type { Member } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";

interface MemberRowProps {
  member: Member;

  onRemove: () => void;
}

export function MemberRow({ member, onRemove }: MemberRowProps) {
  const name = (member.user?.name ?? "").trim();
  const email = (member.user?.email ?? "").trim();

  return (
    <WidgetListItem>
      {member.user ? <UserAvatar size="sm" user={member.user} /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{name ?? "–"}</span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </div>
      <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground capitalize">
        {member.role}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="More actions">
              <MoreVerticalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem
            variant="destructive"
            disabled={member.role === "owner"}
            onClick={onRemove}
          >
            <XIcon /> Remove member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </WidgetListItem>
  );
}

export function MemberRowSkeleton() {
  return (
    <WidgetListItem>
      <UserAvatarSkeleton size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton className="h-4 w-full max-w-32" />
        <Skeleton className="h-4 w-full max-w-48" />
      </div>
      <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
      <Button variant="ghost" size="icon-sm" disabled aria-label="More actions">
        <MoreVerticalIcon />
      </Button>
    </WidgetListItem>
  );
}

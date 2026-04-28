import { MailIcon, MoreVerticalIcon, XIcon } from "lucide-react";
import { WidgetListItem } from "@/components/widget.tsx";
import type { Invitation } from "@/lib/auth.ts";
import { Avatar, AvatarFallback } from "@/ui/avatar.tsx";
import { Button } from "@/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu.tsx";

interface InvitationRowProps {
  invitation: Invitation;

  onCancel: () => void;
}

export function InvitationRow({ invitation, onCancel }: InvitationRowProps) {
  return (
    <WidgetListItem>
      <Avatar>
        <AvatarFallback>
          <MailIcon className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 truncate text-sm font-medium">
          {invitation.email}
          <span className="rounded-md border px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
            invited
          </span>
        </span>
        <span className="truncate text-xs text-muted-foreground capitalize">
          {invitation.role ?? "member"}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="More actions">
              <MoreVerticalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem variant="destructive" onClick={onCancel}>
            <XIcon /> Cancel invitation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </WidgetListItem>
  );
}

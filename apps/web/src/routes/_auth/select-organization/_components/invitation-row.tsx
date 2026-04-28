import { Loader2Icon, MailIcon } from "lucide-react";
import type { Invitation } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";

interface InvitationRowProps {
  invitation: Invitation & {
    organizationName: string;
  };
  isDisabled: boolean;
  isLoading: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function InvitationRow({
  invitation,
  isDisabled,
  isLoading,
  onAccept,
  onDecline,
}: InvitationRowProps) {
  return (
    <div className="rounded-lg border bg-background p-3 space-y-2">
      <div className="flex items-start gap-2">
        <MailIcon className="size-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{invitation.organizationName}</p>
          <p className="text-xs text-muted-foreground">Invited as {invitation.role}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="flex-1"
          disabled={isDisabled || isLoading}
          onClick={onAccept}
        >
          {isLoading ? <Loader2Icon className="size-3.5 animate-spin" /> : "Accept"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="flex-1"
          disabled={isDisabled || isLoading}
          onClick={onDecline}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}

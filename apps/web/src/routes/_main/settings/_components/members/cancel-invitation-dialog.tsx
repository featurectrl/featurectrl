import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import { type Invitation, useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";

interface CancelInvitationDialogProps {
  handle: DialogPrimitive.Handle<{ invitation: Invitation }>;
}

export function CancelInvitationDialog({ handle }: CancelInvitationDialogProps) {
  const betterAuth = useBetterAuth();

  const payload = useDialogHandlePayload(handle);

  const cancelMutation = useMutation(
    betterAuth.organization.cancelInvitation.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries({
          queryKey: betterAuth.organization.listUserInvitations.queryKey(),
        });

        toast.success("Invitation cancelled");
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not cancel invitation");
      },
    }),
  );

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel invitation?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{payload.invitation.email}</span> will
              no longer be able to join with their current invite link. You can send a new invite
              later.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handle.close()}
              disabled={cancelMutation.isPending}
            >
              Keep invitation
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate({ invitationId: payload.invitation.id })}
            >
              {cancelMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Cancel invitation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

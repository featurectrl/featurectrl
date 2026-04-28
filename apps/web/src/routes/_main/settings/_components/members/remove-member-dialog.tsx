import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import { type Member, useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";

interface RemoveMemberDialogProps {
  handle: DialogPrimitive.Handle<{ member: Member }>;
}

export function RemoveMemberDialog({ handle }: RemoveMemberDialogProps) {
  const betterAuth = useBetterAuth();

  const payload = useDialogHandlePayload(handle);

  const removeMutation = useMutation(
    betterAuth.organization.removeMember.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries({
          queryKey: betterAuth.organization.getFullOrganization.queryKey(),
        });

        toast.success("Member removed");
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not remove member");
      },
    }),
  );

  const name = (payload?.member.user?.name ?? "").trim();
  const email = (payload?.member.user?.email ?? "").trim();
  const label = name || email || "this member";

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove member?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{label}</span> will lose access to this
              organization. You can re-invite them later.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handle.close()}
              disabled={removeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate({ memberIdOrEmail: payload.member.id })}
            >
              {removeMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Remove member"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

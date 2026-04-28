import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";

interface RevokeOtherSessionsDialogProps {
  handle: DialogPrimitive.Handle<void>;
}

export function RevokeOtherSessionsDialog({ handle }: RevokeOtherSessionsDialogProps) {
  const betterAuth = useBetterAuth();

  const revokeOthersMutation = useMutation(
    betterAuth.revokeOtherSessions.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        toast.success("Other sessions signed out");
        await client.invalidateQueries({ queryKey: betterAuth.listSessions.queryKey() });
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not revoke sessions");
      },
    }),
  );

  return (
    <Dialog handle={handle}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign out everywhere else?</DialogTitle>
          <DialogDescription>
            All other devices currently signed in to your account will be signed out immediately and
            will need to log in again. This device will stay signed in.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handle.close()}
            disabled={revokeOthersMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={revokeOthersMutation.isPending}
            onClick={() => revokeOthersMutation.mutate()}
          >
            {revokeOthersMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Sign out everywhere else"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

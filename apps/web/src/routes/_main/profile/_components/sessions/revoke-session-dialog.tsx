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
import type { SessionItem } from "./session-row.tsx";

interface RevokeSessionDialogProps {
  handle: DialogPrimitive.Handle<void>;
  session: Pick<SessionItem, "token">;
}

export function RevokeSessionDialog({ handle, session }: RevokeSessionDialogProps) {
  const betterAuth = useBetterAuth();

  const revokeMutation = useMutation(
    betterAuth.revokeSession.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        toast.success("Session revoked");
        await client.invalidateQueries({ queryKey: betterAuth.listSessions.queryKey() });
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not revoke session");
      },
    }),
  );

  return (
    <Dialog handle={handle}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revoke session?</DialogTitle>
          <DialogDescription>
            This device will be signed out immediately and will need to log in again to access your
            account.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handle.close()}
            disabled={revokeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={revokeMutation.isPending}
            onClick={() => revokeMutation.mutate({ token: session.token })}
          >
            {revokeMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Revoke session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

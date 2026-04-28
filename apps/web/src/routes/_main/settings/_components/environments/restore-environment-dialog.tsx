import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import { useTRPC } from "@/lib/trpc.ts";
import type { Environment } from "@/lib/trpc.types";
import { Button } from "@/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";

interface RestoreEnvironmentDialogProps {
  handle: DialogPrimitive.Handle<{ environment: Environment }>;
}

export function RestoreEnvironmentDialog({ handle }: RestoreEnvironmentDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const payload = useDialogHandlePayload(handle);

  const restoreMutation = useMutation(
    trpc.environments.restore.mutationOptions({
      onSuccess: async () => {
        toast.success("Environment restored");
        await queryClient.invalidateQueries(trpc.environments.list.queryFilter());
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore {payload.environment.displayName}?</DialogTitle>
            <DialogDescription>
              Restoring will make this environment active again and visible in the flag matrix.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handle.close()}
              disabled={restoreMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={restoreMutation.isPending}
              onClick={() => restoreMutation.mutate({ id: payload.environment.id })}
            >
              {restoreMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Restore environment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferOutput } from "@trpc/tanstack-react-query";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import { useTRPC } from "@/lib/trpc.ts";
import type { PublicKey } from "@/lib/trpc.types";
import { Button } from "@/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";
import { Field, FieldLabel } from "@/ui/field.tsx";
import { CopyableKey } from "../keys/copyable-key.tsx";

type Secret = inferOutput<ReturnType<typeof useTRPC>["publicKeys"]["regenerate"]>;

interface RegeneratePublicKeyDialogProps {
  handle: DialogPrimitive.Handle<{ publicKey: PublicKey }>;
}

export function RegeneratePublicKeyDialog({ handle }: RegeneratePublicKeyDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [regeneratedKey, setRegeneratedKey] = useState<Secret | null>(null);

  const payload = useDialogHandlePayload(handle);

  useEffect(() => {
    if (!payload) setRegeneratedKey(null);
  }, [payload]);

  const regenerateMutation = useMutation(
    trpc.publicKeys.regenerate.mutationOptions({
      onSuccess: async (data) => {
        toast.success("Key regenerated");
        await queryClient.invalidateQueries(trpc.publicKeys.list.queryFilter());
        setRegeneratedKey(data);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent className="sm:max-w-md">
          {regeneratedKey == null ? (
            <>
              <DialogHeader>
                <DialogTitle>Regenerate key for {payload.publicKey.displayName}?</DialogTitle>
                <DialogDescription>
                  The existing public key will stop working immediately. Any client still using it
                  will need to be updated.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handle.close()}
                  disabled={regenerateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => regenerateMutation.mutate({ id: payload.publicKey.id })}
                  disabled={regenerateMutation.isPending}
                >
                  {regenerateMutation.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    "Regenerate key"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Key regenerated</DialogTitle>
                <DialogDescription>
                  A new key for <span className="font-medium">{payload.publicKey.displayName}</span>{" "}
                  is ready.
                </DialogDescription>
              </DialogHeader>

              <Field>
                <FieldLabel htmlFor="reveal-regenerated-public-key">Public key</FieldLabel>
                <CopyableKey id="reveal-regenerated-public-key" value={regeneratedKey.secret.key} />
              </Field>

              <DialogFooter>
                <Button type="button" onClick={() => handle.close()}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}

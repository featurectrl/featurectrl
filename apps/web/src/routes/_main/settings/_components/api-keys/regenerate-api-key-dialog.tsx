import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferOutput } from "@trpc/tanstack-react-query";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import { useTRPC } from "@/lib/trpc.ts";
import type { ApiKey } from "@/lib/trpc.types";
import { Button } from "@/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";
import { ApiKeySecretsView } from "./api-key-secrets-view.tsx";

type Secrets = inferOutput<ReturnType<typeof useTRPC>["apiKeys"]["regenerate"]>;

interface RegenerateApiKeyDialogProps {
  handle: DialogPrimitive.Handle<{ apiKey: ApiKey }>;
}

export function RegenerateApiKeyDialog({ handle }: RegenerateApiKeyDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [regeneratedKey, setRegeneratedKey] = useState<Secrets | null>(null);

  const payload = useDialogHandlePayload(handle);

  useEffect(() => {
    if (!payload) setRegeneratedKey(null);
  }, [payload]);

  const regenerateMutation = useMutation(
    trpc.apiKeys.regenerate.mutationOptions({
      onSuccess: async (data) => {
        toast.success("Keys regenerated");
        await queryClient.invalidateQueries(trpc.apiKeys.list.queryFilter());
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
                <DialogTitle>Regenerate keys for {payload.apiKey.displayName}?</DialogTitle>
                <DialogDescription>
                  The existing public and private keys will stop working immediately. Any client
                  still using them will need to be updated.
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
                  onClick={() => regenerateMutation.mutate({ id: payload.apiKey.id })}
                  disabled={regenerateMutation.isPending}
                >
                  {regenerateMutation.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    "Regenerate keys"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Keys regenerated</DialogTitle>
                <DialogDescription>
                  New keys for <span className="font-medium">{payload.apiKey.displayName}</span> are
                  ready.
                </DialogDescription>
              </DialogHeader>

              <ApiKeySecretsView
                publicKey={regeneratedKey.secrets.publicKey}
                privateKey={regeneratedKey.secrets.privateKey}
              />

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

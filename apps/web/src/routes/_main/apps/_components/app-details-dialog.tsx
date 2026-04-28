import type { Dialog as DialogPrimitive } from "@base-ui/react";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import type { App } from "@/lib/trpc.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";
import { JsonCode } from "@/ui/json-code.tsx";

interface AppDetailsDialogProps {
  handle: DialogPrimitive.Handle<{
    app: App;
  }>;
}

export function AppDetailsDialog({ handle }: AppDetailsDialogProps) {
  const payload = useDialogHandlePayload(handle);

  const config = payload
    ? {
        app: payload.app.name,
        flags: Object.fromEntries(
          payload.app.featureFlags.map((featureFlag) => [featureFlag.name, {}]),
        ),
        segments: payload.app.userSegments.map((segment) => segment.name),
      }
    : {};

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{payload.app.name}</DialogTitle>
            <DialogDescription>Connections reported from your codebase.</DialogDescription>
          </DialogHeader>

          <JsonCode value={config} />

          <DialogFooter showCloseButton />
        </DialogContent>
      )}
    </Dialog>
  );
}

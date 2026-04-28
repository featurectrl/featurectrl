import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import { type Organization, useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";
import { Field, FieldDescription, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

interface DeleteOrganizationConfirmationDialogProps {
  handle: DialogPrimitive.Handle<{ organization: Organization }>;
}

export function DeleteOrganizationConfirmationDialog({
  handle,
}: DeleteOrganizationConfirmationDialogProps) {
  const betterAuth = useBetterAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState("");

  const payload = useDialogHandlePayload(handle);

  const deleteMutation = useMutation(
    betterAuth.organization.deleteOrganization.mutationOptions({
      onSuccess: async () => {
        toast.success("Organization deleted");
        handle.close();
        await navigate({ to: "/select-organization" });
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not delete organization");
      },
    }),
  );

  function onOpenChange(next: boolean) {
    if (!next) {
      setConfirm("");
    }
  }

  return (
    <Dialog handle={handle} onOpenChange={onOpenChange}>
      {!!payload && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {payload.organization.name}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All flags, environments, members and history will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <Field className="mt-2">
            <FieldLabel htmlFor="confirm-slug">
              Type <span className="font-mono">{payload.organization.slug}</span> to confirm
            </FieldLabel>
            <Input
              id="confirm-slug"
              className="font-mono"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
            />
            <FieldDescription>The organization slug must match exactly.</FieldDescription>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handle.close()}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={confirm !== payload.organization.slug || deleteMutation.isPending}
              onClick={() => deleteMutation.mutate({ organizationId: payload.organization.id })}
            >
              {deleteMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Delete organization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

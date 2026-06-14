import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import { useFormDeps } from "@/hooks/use-form-deps.ts";
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
import { Field, FieldError, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

const formSchema = z.object({
  displayName: z.string().min(1, "Required").max(100, "Too long"),
});

type FormValues = z.infer<typeof formSchema>;

interface ChangePublicKeyNameDialogProps {
  handle: DialogPrimitive.Handle<{ publicKey: PublicKey }>;
}

export function ChangePublicKeyNameDialog({ handle }: ChangePublicKeyNameDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const payload = useDialogHandlePayload(handle);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { displayName: "" },
  });

  useFormDeps(form, [payload?.publicKey.id], {
    defaultValues: { displayName: payload?.publicKey.displayName ?? "" },
  });

  const updateMutation = useMutation(
    trpc.publicKeys.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Display name updated");
        await queryClient.invalidateQueries(trpc.publicKeys.list.queryFilter());
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = form.handleSubmit((values) => {
    if (!payload) {
      throw new Error();
    }

    updateMutation.mutate({ id: payload.publicKey.id, displayName: values.displayName });
  });

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change name</DialogTitle>
            <DialogDescription>Rename {payload.publicKey.displayName}.</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="change-public-key-display-name">Name</FieldLabel>
              <Input
                id="change-public-key-display-name"
                autoFocus
                autoComplete="off"
                placeholder="Web app"
                {...form.register("displayName")}
              />
              <FieldError>{form.formState.errors.displayName?.message}</FieldError>
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handle.close()}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

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
import { Field, FieldError, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

const formSchema = z.object({
  displayName: z.string().min(1, "Required").max(100, "Too long"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditEnvironmentDialogProps {
  handle: DialogPrimitive.Handle<{ environment: Environment }>;
}

export function EditEnvironmentDialog({ handle }: EditEnvironmentDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const payload = useDialogHandlePayload(handle);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { displayName: "" },
  });

  useFormDeps(form, [payload?.environment.id], {
    defaultValues: { displayName: payload?.environment.displayName ?? "" },
  });

  const updateMutation = useMutation(
    trpc.environments.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Environment updated");
        await queryClient.invalidateQueries(trpc.environments.list.queryFilter());
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

    updateMutation.mutate({
      id: payload.environment.id,
      data: { displayName: values.displayName },
    });
  });

  const canSave = form.formState.isDirty && !updateMutation.isPending;

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {payload.environment.displayName}</DialogTitle>
            <DialogDescription>
              Slug <span className="font-mono">{payload.environment.name}</span> can't be changed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="edit-env-display-name">Name</FieldLabel>
              <Input
                id="edit-env-display-name"
                autoFocus
                autoComplete="off"
                {...form.register("displayName")}
              />
              <FieldError>{form.formState.errors.displayName?.message}</FieldError>
            </Field>

            <Field>
              <Input
                id="edit-env-name"
                className="font-mono"
                value={payload.environment.name}
                disabled
                readOnly
              />
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
              <Button type="submit" disabled={!canSave}>
                {updateMutation.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

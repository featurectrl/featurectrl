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
import { Field, FieldDescription, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

const formSchema = z.object({
  confirm: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface DeleteEnvironmentDialogProps {
  handle: DialogPrimitive.Handle<{ environment: Environment }>;
}

export function DeleteEnvironmentDialog({ handle }: DeleteEnvironmentDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const payload = useDialogHandlePayload(handle);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { confirm: "" },
  });

  useFormDeps(form, [payload?.environment.id]);

  const deleteMutation = useMutation(
    trpc.environments.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Environment deleted");
        await queryClient.invalidateQueries(trpc.environments.list.queryFilter());
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const matches = form.watch("confirm") === payload?.environment.name;

  const onSubmit = form.handleSubmit(() => {
    if (!payload) {
      throw new Error();
    }

    deleteMutation.mutate({ id: payload.environment.id });
  });

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {payload.environment.displayName}?</DialogTitle>
            <DialogDescription>
              This permanently deletes the environment and all of its feature flag values. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="confirm-delete-env-name">
                Type <span className="font-mono">{payload.environment.name}</span> to confirm
              </FieldLabel>
              <Input
                id="confirm-delete-env-name"
                className="font-mono"
                autoComplete="off"
                placeholder={payload.environment.name}
                {...form.register("confirm")}
              />
              <FieldDescription>The environment name must match exactly.</FieldDescription>
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handle.close()}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!matches || deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Delete environment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

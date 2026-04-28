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

interface ArchiveEnvironmentDialogProps {
  handle: DialogPrimitive.Handle<{ environment: Environment }>;
}

export function ArchiveEnvironmentDialog({ handle }: ArchiveEnvironmentDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const payload = useDialogHandlePayload(handle);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { confirm: "" },
  });

  useFormDeps(form, [payload?.environment.id]);

  const archiveMutation = useMutation(
    trpc.environments.archive.mutationOptions({
      onSuccess: async () => {
        toast.success("Environment archived");
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

    archiveMutation.mutate({ id: payload.environment.id });
  });

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive {payload.environment.displayName}?</DialogTitle>
            <DialogDescription>
              Archived environments are read-only and hidden from the flag matrix by default.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="confirm-env-name">
                Type <span className="font-mono">{payload.environment.name}</span> to confirm
              </FieldLabel>
              <Input
                id="confirm-env-name"
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
                disabled={archiveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!matches || archiveMutation.isPending}
              >
                {archiveMutation.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Archive environment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

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
import { Field, FieldDescription, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

const formSchema = z.object({
  confirm: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface DeleteApiKeyDialogProps {
  handle: DialogPrimitive.Handle<{ apiKey: ApiKey }>;
}

export function DeleteApiKeyDialog({ handle }: DeleteApiKeyDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const payload = useDialogHandlePayload(handle);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { confirm: "" },
  });

  useFormDeps(form, [payload?.apiKey.id]);

  const deleteMutation = useMutation(
    trpc.apiKeys.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("API key deleted");
        await queryClient.invalidateQueries(trpc.apiKeys.list.queryFilter());
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const matches = form.watch("confirm") === payload?.apiKey.displayName;

  const onSubmit = form.handleSubmit(() => {
    if (!payload) {
      throw new Error();
    }

    deleteMutation.mutate({ id: payload.apiKey.id });
  });

  return (
    <Dialog handle={handle}>
      {!!payload && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {payload.apiKey.displayName}?</DialogTitle>
            <DialogDescription>
              This permanently deletes the API key. Any client still using it will stop working
              immediately. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="confirm-delete-api-key-name">
                Type <span className="font-mono">{payload.apiKey.displayName}</span> to confirm
              </FieldLabel>
              <Input
                id="confirm-delete-api-key-name"
                autoComplete="off"
                placeholder={payload.apiKey.displayName}
                {...form.register("confirm")}
              />
              <FieldDescription>The API key name must match exactly.</FieldDescription>
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
                  "Delete API key"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferOutput } from "@trpc/tanstack-react-query";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useTRPC } from "@/lib/trpc.ts";
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
import { ApiKeySecretsView } from "./api-key-secrets-view.tsx";

const formSchema = z.object({
  displayName: z.string().min(1, "Required").max(100, "Too long"),
});

type FormValues = z.infer<typeof formSchema>;

type ApiKeyWithSecrets = inferOutput<ReturnType<typeof useTRPC>["apiKeys"]["create"]>;

interface CreateApiKeyDialogProps {
  handle: DialogPrimitive.Handle<void>;
}

export function CreateApiKeyDialog({ handle }: CreateApiKeyDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [createdKey, setCreatedKey] = useState<ApiKeyWithSecrets | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { displayName: "" },
  });

  const createMutation = useMutation(
    trpc.apiKeys.create.mutationOptions({
      onSuccess: async (data) => {
        toast.success("API key created");
        await queryClient.invalidateQueries(trpc.apiKeys.list.queryFilter());
        setCreatedKey(data);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  function onOpenChange(next: boolean) {
    if (!next) {
      form.reset();
      setCreatedKey(null);
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    createMutation.mutate({ displayName: values.displayName });
  });

  return (
    <Dialog handle={handle} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {createdKey == null ? (
          <>
            <DialogHeader>
              <DialogTitle>Generate new API key</DialogTitle>
              <DialogDescription>
                Generate a new public/private key pair for accessing the API.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="api-key-display-name">Name</FieldLabel>
                <Input
                  id="api-key-display-name"
                  autoFocus
                  autoComplete="off"
                  placeholder="GitHub CI"
                  {...form.register("displayName")}
                />
                <FieldError>{form.formState.errors.displayName?.message}</FieldError>
              </Field>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handle.close()}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>API key created</DialogTitle>
              <DialogDescription>
                <span className="font-medium">{createdKey.apiKey.displayName}</span> is ready to
                use.
              </DialogDescription>
            </DialogHeader>

            <ApiKeySecretsView
              publicKey={createdKey.secrets.publicKey}
              privateKey={createdKey.secrets.privateKey}
            />

            <DialogFooter>
              <Button type="button" onClick={() => handle.close()}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

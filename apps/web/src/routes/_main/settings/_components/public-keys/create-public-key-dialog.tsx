import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferOutput } from "@trpc/tanstack-react-query";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { CopyableKey } from "../keys/copyable-key.tsx";
import { DEFAULT_EXPIRY, ExpirySelect, expiryToDays } from "../keys/expiry-select.tsx";

const formSchema = z.object({
  displayName: z.string().min(1, "Required").max(100, "Too long"),
  expiry: z.enum(["30", "90", "365", "never"]),
});

type FormValues = z.infer<typeof formSchema>;

type PublicKeyWithSecret = inferOutput<ReturnType<typeof useTRPC>["publicKeys"]["create"]>;

interface CreatePublicKeyDialogProps {
  handle: DialogPrimitive.Handle<void>;
}

export function CreatePublicKeyDialog({ handle }: CreatePublicKeyDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [createdKey, setCreatedKey] = useState<PublicKeyWithSecret | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { displayName: "", expiry: DEFAULT_EXPIRY },
  });

  const createMutation = useMutation(
    trpc.publicKeys.create.mutationOptions({
      onSuccess: async (data) => {
        toast.success("Public key created");
        await queryClient.invalidateQueries(trpc.publicKeys.list.queryFilter());
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
    createMutation.mutate({
      displayName: values.displayName,
      expiresInDays: expiryToDays(values.expiry),
    });
  });

  return (
    <Dialog handle={handle} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {createdKey == null ? (
          <>
            <DialogHeader>
              <DialogTitle>Generate new public key</DialogTitle>
              <DialogDescription>
                Generate a new public key for client-side access to the API.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="public-key-display-name">Name</FieldLabel>
                <Input
                  id="public-key-display-name"
                  autoFocus
                  autoComplete="off"
                  placeholder="Web app"
                  {...form.register("displayName")}
                />
                <FieldError>{form.formState.errors.displayName?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="public-key-expiry">Expiration</FieldLabel>
                <Controller
                  control={form.control}
                  name="expiry"
                  render={({ field }) => (
                    <ExpirySelect
                      id="public-key-expiry"
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={createMutation.isPending}
                    />
                  )}
                />
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
              <DialogTitle>Public key created</DialogTitle>
              <DialogDescription>
                <span className="font-medium">{createdKey.publicKey.displayName}</span> is ready to
                use.
              </DialogDescription>
            </DialogHeader>

            <Field>
              <FieldLabel htmlFor="reveal-public-key">Public key</FieldLabel>
              <CopyableKey id="reveal-public-key" value={createdKey.secret.key} />
            </Field>

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

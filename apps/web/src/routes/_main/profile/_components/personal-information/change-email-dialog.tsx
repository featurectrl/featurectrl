import type { Dialog as DialogPrimitive } from "@base-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useBetterAuth } from "@/lib/auth.ts";
import { absoluteURL } from "@/lib/urls.ts";
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
  newEmail: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type FormValues = z.infer<typeof formSchema>;

interface ChangeEmailDialogProps {
  handle: DialogPrimitive.Handle<void>;
  currentEmail: string;
}

export function ChangeEmailDialog({ handle, currentEmail }: ChangeEmailDialogProps) {
  const betterAuth = useBetterAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { newEmail: "" },
  });

  const changeEmailMutation = useMutation(
    betterAuth.changeEmail.mutationOptions({
      onSuccess: () => {
        toast.success("Check your inbox to confirm the change");
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not change email");
      },
    }),
  );

  function onOpenChange(next: boolean) {
    if (!next) {
      form.reset();
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    await changeEmailMutation.mutateAsync({
      newEmail: values.newEmail,
      callbackURL: absoluteURL({ to: "/profile" }),
    });

    handle.close();
  });

  return (
    <Dialog handle={handle} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
          <DialogDescription>
            We'll send a confirmation link to <span className="font-medium">{currentEmail}</span>.
            The change will only take effect after you click it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate>
          <Field>
            <FieldLabel htmlFor="new-email">New email</FieldLabel>
            <Input
              id="new-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              autoFocus
              {...form.register("newEmail")}
            />
            <FieldError>{form.formState.errors.newEmail?.message}</FieldError>
          </Field>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => handle.close()}>
              Cancel
            </Button>
            <Button type="submit" disabled={changeEmailMutation.isPending}>
              {changeEmailMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Send confirmation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

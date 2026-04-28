import type { DialogRootProps } from "@base-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { type Member, useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group.tsx";

const ROLES = ["member", "admin", "owner"] as const satisfies Member["role"][];

const ROLE_DESCRIPTIONS: Record<Member["role"], string> = {
  member: "Can view and toggle feature flags.",
  admin: "Manages flags, environments, and members.",
  owner: "Full access, including billing and deletion.",
};

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(ROLES),
});

type FormValues = z.infer<typeof formSchema>;

interface InviteMemberDialogProps {
  handle: NonNullable<DialogRootProps["handle"]>;
}

export function InviteMemberDialog({ handle }: InviteMemberDialogProps) {
  const betterAuth = useBetterAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", role: "member" },
  });

  const inviteMutation = useMutation(
    betterAuth.organization.inviteMember.mutationOptions({
      onSuccess: async (_data, variables, _, { client }) => {
        await client.invalidateQueries({
          queryKey: betterAuth.organization.listUserInvitations.queryKey(),
        });

        toast.success(`Invited ${variables.email}`);
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not send invite");
      },
    }),
  );

  const onSubmit = form.handleSubmit(async (values) => {
    await inviteMutation.mutateAsync({
      email: values.email,
      role: values.role,
    });
    form.reset(values);
    handle.close();
  });

  return (
    <Dialog handle={handle}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            They'll get an email with a link to join this organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate>
          <FieldGroup className="mb-4">
            <Field>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                autoFocus
                {...form.register("email")}
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>
            <Field>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    {ROLES.map((role) => {
                      const itemId = `invite-role-${role}`;
                      return (
                        <label
                          key={role}
                          htmlFor={itemId}
                          className="flex cursor-pointer items-start gap-3 my-0.5 rounded-lg bg-transparent transition-colors"
                        >
                          <RadioGroupItem id={itemId} value={role} className="mt-0.5" />
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-sm font-medium capitalize leading-none">
                              {role}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {ROLE_DESCRIPTIONS[role]}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </RadioGroup>
                )}
              />
              <FieldError>{form.formState.errors.role?.message}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handle.close()}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Send invite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

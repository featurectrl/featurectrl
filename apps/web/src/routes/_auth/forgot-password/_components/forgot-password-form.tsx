import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm({ onSubmitted }: { onSubmitted: () => void }) {
  const betterAuth = useBetterAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const requestPasswordReset = useMutation(
    betterAuth.requestPasswordReset.mutationOptions({
      onError: (error) => {
        toast.error(error.message ?? "Could not send reset link");
      },
    }),
  );

  const onSubmit = form.handleSubmit(async (values) => {
    await requestPasswordReset.mutateAsync({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    onSubmitted();
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...form.register("email")}
          />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Send reset link"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}

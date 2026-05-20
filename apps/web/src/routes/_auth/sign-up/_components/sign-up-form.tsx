import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type FormValues = z.infer<typeof formSchema>;

export function SignUpForm() {
  const betterAuth = useBetterAuth();
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signUpUsingEmail = useMutation(
    betterAuth.signUp.email.mutationOptions({
      onError: (error) => {
        toast.error(error.message ?? "Could not create account");
      },
    }),
  );

  const onSubmit = form.handleSubmit(async (values) => {
    await signUpUsingEmail.mutateAsync({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    await navigate({ to: "/verify-email" });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" autoComplete="name" autoFocus {...form.register("name")} />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
          <FieldError>{form.formState.errors.confirmPassword?.message}</FieldError>
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Create account"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}

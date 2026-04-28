import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useBetterAuth } from "@/lib/auth.ts";
import { slugify } from "@/lib/slugify.ts";
import { Button } from "@/ui/button.tsx";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(2, "At least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateOrganizationFormProps {
  className?: string;
}

export function CreateOrganizationForm({ className }: CreateOrganizationFormProps) {
  const betterAuth = useBetterAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", slug: "" },
  });

  const createOrganization = useMutation(
    betterAuth.organization.create.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries({
          queryKey: betterAuth.organization.list.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not create organization");
      },
    }),
  );

  const setActiveOrganization = useMutation(
    betterAuth.organization.setActive.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries();
      },
    }),
  );

  const onSubmit = form.handleSubmit(async (values) => {
    const created = await createOrganization.mutateAsync({
      name: values.name,
      slug: values.slug,
    });

    if (!created) {
      return;
    }

    try {
      await setActiveOrganization.mutateAsync({
        organizationId: created.id,
      });
      await navigate({ to: "/" });
    } catch {
      await navigate({ to: "/select-organization" });
    }
  });

  return (
    <form className={className} onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            autoComplete="organization"
            autoFocus
            {...form.register("name", {
              onChange: (e) => {
                if (!form.formState.touchedFields.slug) {
                  form.setValue("slug", slugify(e.target.value), {
                    shouldValidate: form.formState.isSubmitted,
                    shouldTouch: false,
                  });
                }
              },
            })}
          />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input id="slug" autoComplete="off" {...form.register("slug")} />
          <FieldError>{form.formState.errors.slug?.message}</FieldError>
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Create organization"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}

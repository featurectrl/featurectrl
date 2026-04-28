import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { type UseFormReturn, useController, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { slugify, slugRegex } from "@/lib/slugify.ts";
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

const formSchema = z.object({
  displayName: z.string().min(1, "Required").max(100, "Too long"),
  name: z
    .string()
    .min(1, "Required")
    .max(100, "Too long")
    .regex(slugRegex, "Lowercase letters, numbers and dashes only"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateEnvironmentDialogProps {
  handle: DialogPrimitive.Handle<void>;
}

export function CreateEnvironmentDialog({ handle }: CreateEnvironmentDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { displayName: "", name: "" },
  });

  const createMutation = useMutation(
    trpc.environments.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Environment created");
        await queryClient.invalidateQueries(trpc.environments.list.queryFilter());
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  function onOpenChange(next: boolean) {
    if (!next) {
      form.reset();
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    createMutation.mutate({
      displayName: values.displayName,
      name: values.name,
    });
  });

  return (
    <Dialog handle={handle} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New environment</DialogTitle>
          <DialogDescription>
            Environments hold an independent set of flag values.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <EnvironmentNameFormField form={form} />

          <Field>
            <div className="flex items-center gap-2">
              <Input
                id="env-name"
                autoComplete="off"
                placeholder="production"
                className="font-mono"
                {...form.register("name")}
              />
            </div>
            <FieldError>{form.formState.errors.name?.message}</FieldError>
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
      </DialogContent>
    </Dialog>
  );
}

interface EnvironmentNameFormFieldProps {
  form: UseFormReturn<FormValues>;
}

function EnvironmentNameFormField({ form }: EnvironmentNameFormFieldProps) {
  const name = useController({
    name: "name",
    control: form.control,
  });

  return (
    <Field>
      <FieldLabel htmlFor="env-display-name">Display name</FieldLabel>
      <Input
        id="env-display-name"
        autoFocus
        autoComplete="off"
        placeholder="Production"
        {...form.register("displayName", {
          onChange: (e) => {
            if (!name.fieldState.isTouched) {
              form.setValue("name", slugify(e.target.value), {
                shouldValidate: true,
                shouldTouch: false,
              });
            }
          },
        })}
      />
      <FieldError>{form.formState.errors.displayName?.message}</FieldError>
    </Field>
  );
}

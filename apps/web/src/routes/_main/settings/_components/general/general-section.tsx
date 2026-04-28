import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Widget,
  WidgetFooter,
  WidgetHeader,
  WidgetHeaderText,
  WidgetRow,
  WidgetRowLabel,
  WidgetRowLabelDescription,
  WidgetRowLabelTitle,
  WidgetRows,
  WidgetTitle,
} from "@/components/widget.tsx";
import { useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import { FieldError } from "@/ui/field.tsx";
import { Input, InputSkeleton } from "@/ui/input.tsx";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(2, "At least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
});

type FormValues = z.infer<typeof formSchema>;

export function GeneralSection() {
  return (
    <Suspense fallback={<GeneralSectionSkeleton />}>
      <GeneralSectionWithQuery />
    </Suspense>
  );
}

export function GeneralSectionWithQuery() {
  const betterAuth = useBetterAuth();

  const { data: organization } = useSuspenseQuery(
    betterAuth.organization.getFullOrganization.queryOptions(),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: organization?.name ?? "", slug: organization?.slug ?? "" },
  });

  const updateMutation = useMutation(
    betterAuth.organization.update.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries({
          queryKey: [
            betterAuth.organization.getFullOrganization.queryKey(),
            betterAuth.organization.list.queryKey(),
          ],
        });
        toast.success("Organization updated");
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not update organization");
      },
    }),
  );

  const onSubmit = form.handleSubmit(async (values) => {
    await updateMutation.mutateAsync({
      data: { name: values.name, slug: values.slug },
    });
    form.reset(values);
  });

  if (!organization) {
    return null;
  }

  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Organization</WidgetTitle>
        </WidgetHeaderText>
      </WidgetHeader>

      <form onSubmit={onSubmit} noValidate>
        <WidgetRows>
          <WidgetRow>
            <WidgetRowLabel>
              <WidgetRowLabelTitle>
                <label htmlFor="org-name">Name</label>
              </WidgetRowLabelTitle>
            </WidgetRowLabel>
            <div className="flex flex-col gap-1">
              <Input
                id="org-name"
                className="max-w-sm"
                autoComplete="organization"
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </div>
          </WidgetRow>
          <WidgetRow>
            <WidgetRowLabel>
              <WidgetRowLabelTitle>
                <label htmlFor="org-slug">Slug</label>
              </WidgetRowLabelTitle>
              <WidgetRowLabelDescription>Used in URLs and SDK requests.</WidgetRowLabelDescription>
            </WidgetRowLabel>
            <div className="flex flex-col gap-1">
              <div className="flex max-w-sm items-center gap-2">
                <Input id="org-slug" className="font-mono" {...form.register("slug")} />
              </div>
              <FieldError>{form.formState.errors.slug?.message}</FieldError>
            </div>
          </WidgetRow>
        </WidgetRows>

        <AnimatePresence initial={false}>
          {form.formState.isDirty && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <WidgetFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty}
                  onClick={() => form.reset()}
                >
                  <XIcon />
                  Revert
                </Button>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <>
                      <CheckIcon />
                      Save
                    </>
                  )}
                </Button>
              </WidgetFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Widget>
  );
}

export function GeneralSectionSkeleton() {
  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Organization</WidgetTitle>
        </WidgetHeaderText>
      </WidgetHeader>

      <WidgetRows>
        <WidgetRow>
          <WidgetRowLabel>
            <WidgetRowLabelTitle>Name</WidgetRowLabelTitle>
          </WidgetRowLabel>
          <InputSkeleton className="max-w-96" />
        </WidgetRow>
        <WidgetRow>
          <WidgetRowLabel>
            <WidgetRowLabelTitle>Slug</WidgetRowLabelTitle>
            <WidgetRowLabelDescription>Used in URLs and SDK requests.</WidgetRowLabelDescription>
          </WidgetRowLabel>
          <InputSkeleton className="max-w-96" />
        </WidgetRow>
      </WidgetRows>
    </Widget>
  );
}

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
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import { DialogTrigger } from "@/ui/dialog.tsx";
import { FieldError } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";
import { ChangeEmailDialog } from "./change-email-dialog.tsx";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function PersonalInformationSection() {
  return (
    <Suspense fallback={<PersonalInformationSectionSkeleton />}>
      <PersonalInformationSectionWithQuery />
    </Suspense>
  );
}

export function PersonalInformationSectionWithQuery() {
  const betterAuth = useBetterAuth();

  const { data: session } = useSuspenseQuery(betterAuth.getSession.queryOptions());

  const changeEmailDialogHandle = useDialogHandle();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: session?.user.name ?? "" },
  });

  const updateUser = useMutation(
    betterAuth.updateUser.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries({
          queryKey: betterAuth.getSession.queryKey(),
        });
        toast.success("Profile updated");
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not update profile");
      },
    }),
  );

  const onSubmit = form.handleSubmit(async (values) => {
    await updateUser.mutateAsync({ name: values.name });
    form.reset(values);
  });

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Personal information</WidgetTitle>
        </WidgetHeaderText>
      </WidgetHeader>

      <form onSubmit={onSubmit} noValidate>
        <WidgetRows>
          <WidgetRow>
            <WidgetRowLabel>
              <WidgetRowLabelTitle>
                <label htmlFor="profile-name">Name</label>
              </WidgetRowLabelTitle>
              <WidgetRowLabelDescription>How you appear to teammates.</WidgetRowLabelDescription>
            </WidgetRowLabel>
            <div className="flex flex-col gap-1">
              <Input
                id="profile-name"
                className="max-w-sm"
                autoComplete="name"
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </div>
          </WidgetRow>

          <WidgetRow>
            <WidgetRowLabel>
              <WidgetRowLabelTitle>
                <label htmlFor="profile-email">Email</label>
              </WidgetRowLabelTitle>
              <WidgetRowLabelDescription>
                Used to sign in and receive notifications.
              </WidgetRowLabelDescription>
            </WidgetRowLabel>
            <div className="flex flex-col gap-2 max-w-sm">
              <Input id="profile-email" type="email" value={user.email} disabled readOnly />
              <div>
                <DialogTrigger
                  handle={changeEmailDialogHandle}
                  render={<Button variant="outline" size="sm" />}
                >
                  Change email address
                </DialogTrigger>
              </div>
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

      <ChangeEmailDialog handle={changeEmailDialogHandle} currentEmail={user.email} />
    </Widget>
  );
}

export function PersonalInformationSectionSkeleton() {
  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Personal information</WidgetTitle>
        </WidgetHeaderText>
      </WidgetHeader>
      <WidgetRows>
        <WidgetRow>
          <WidgetRowLabel>
            <WidgetRowLabelTitle>
              <label htmlFor="profile-name">Name</label>
            </WidgetRowLabelTitle>
            <WidgetRowLabelDescription>How you appear to teammates.</WidgetRowLabelDescription>
          </WidgetRowLabel>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-8 w-full max-w-sm" />
          </div>
        </WidgetRow>
        <WidgetRow>
          <WidgetRowLabel>
            <WidgetRowLabelTitle>
              <label htmlFor="profile-email">Email</label>
            </WidgetRowLabelTitle>
            <WidgetRowLabelDescription>
              Used to sign in and receive notifications.
            </WidgetRowLabelDescription>
          </WidgetRowLabel>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full max-w-sm" />
            <div>
              <Button variant="outline" size="sm" disabled>
                Change email address
              </Button>
            </div>
          </div>
        </WidgetRow>
      </WidgetRows>
    </Widget>
  );
}

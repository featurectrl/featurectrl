import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import { useFormDeps } from "@/hooks/use-form-deps.ts";
import { useTRPC } from "@/lib/trpc.ts";
import type { UserSegment } from "@/lib/trpc.types.ts";
import { Button } from "@/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.tsx";
import { Field, FieldDescription, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

const formSchema = z.object({
  confirm: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface ArchiveSegmentDialogProps {
  handle: DialogPrimitive.Handle<{
    segment: UserSegment;
  }>;
}

export function ArchiveSegmentDialog({ handle }: ArchiveSegmentDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const payload = useDialogHandlePayload(handle);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { confirm: "" },
  });

  useFormDeps(form, [payload?.segment.id]);

  const archiveMutation = useMutation(
    trpc.segments.archive.mutationOptions({
      onSuccess: async () => {
        toast.success("Segment archived");
        await Promise.all([
          queryClient.invalidateQueries(trpc.segments.list.queryFilter()),
          queryClient.invalidateQueries(trpc.apps.list.queryFilter()),
          queryClient.invalidateQueries(trpc.featureFlags.list.queryFilter()),
        ]);
        handle.close();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const matches = form.watch("confirm") === payload?.segment.name;

  const submit = form.handleSubmit(() => {
    if (!payload) {
      throw new Error();
    }

    archiveMutation.mutate({ id: payload.segment.id });
  });

  return (
    <Dialog
      handle={handle}
      onOpenChange={(newState) => {
        if (!newState) {
          form.reset();
        }
      }}
    >
      {!!payload && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive {payload.segment.name}?</DialogTitle>
            <DialogDescription>
              Archived segments are hidden from the segments list and from filters elsewhere in the
              product.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="confirm-segment-name">
                Type <span className="font-mono">{payload.segment.name}</span> to confirm
              </FieldLabel>
              <Input
                id="confirm-segment-name"
                className="font-mono"
                autoComplete="off"
                placeholder={payload.segment.name}
                {...form.register("confirm")}
              />
              <FieldDescription>The segment name must match exactly.</FieldDescription>
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handle.close()}
                disabled={archiveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!matches || archiveMutation.isPending}
              >
                {archiveMutation.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Archive segment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { match } from "ts-pattern";
import { useDialogHandlePayload } from "@/hooks/use-dialog-handle-payload.ts";
import { useTRPC } from "@/lib/trpc.ts";
import type { FeatureFlag } from "@/lib/trpc.types.ts";
import { CommandDialog } from "@/ui/command.tsx";
import { SetFlagValueCommandBaseValue } from "./set-flag-value-command-base-value.tsx";
import { SetFlagValueCommandSegments } from "./set-flag-value-command-segments.tsx";
import {
  buildFlagValue,
  type FlagBaseValue,
  initialSegmentsFromValue,
  isSegmentBase,
  type SegmentBase,
} from "./utils.ts";

type FlagValue = FeatureFlag["values"][number]["value"];

type WizardState = { step: "base" } | { step: "segments"; base: SegmentBase };

interface SetFlagValueCommandProps {
  handle: DialogPrimitive.Handle<{
    flag: FeatureFlag;
    environmentId: string;
    value: FlagValue | undefined;
  }>;
}

export function SetFlagValueCommand({ handle }: SetFlagValueCommandProps) {
  const trpc = useTRPC();
  const payload = useDialogHandlePayload(handle);

  const [wizard, setWizard] = useState<WizardState>({ step: "base" });

  const initialSegments = useMemo(() => initialSegmentsFromValue(payload?.value), [payload?.value]);

  const updateMutation = useMutation(
    trpc.featureFlags.updateValue.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries(trpc.featureFlags.list.queryFilter());
        toast.success("Flag updated");
        handle.close();
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const pending = updateMutation.isPending;

  const submit = (value: FlagValue) => {
    if (!payload || pending) return;
    updateMutation.mutate({
      featureFlagId: payload.flag.id,
      environmentId: payload.environmentId,
      value,
    });
  };

  const handleBase = (base: FlagBaseValue) => {
    if (isSegmentBase(base)) {
      setWizard({ step: "segments", base });
    } else {
      submit(buildFlagValue(base, new Set()));
    }
  };

  const handleSegments = (segments: ReadonlySet<string>) => {
    if (wizard.step !== "segments") return;
    submit(buildFlagValue(wizard.base, segments));
  };

  return (
    <CommandDialog
      handle={handle}
      title={payload ? `Edit ${payload.flag.name} flag value` : "Edit flag value"}
      description="Set this flag's value for the selected environment"
      onOpenChange={() => {
        setWizard({ step: "base" });
      }}
    >
      {!!payload && wizard.step === "base" && (
        <SetFlagValueCommandBaseValue
          heading={
            <span>
              Set <b>{payload.flag.name}</b> as
            </span>
          }
          onSubmit={handleBase}
          disabled={pending}
        />
      )}

      {!!payload && wizard.step === "segments" && (
        <SetFlagValueCommandSegments
          heading={match(wizard.base)
            .with("enabled-for-segments", () => (
              <span>
                Set <b>{payload.flag.name}</b> as <b>enabled</b> only for
              </span>
            ))
            .with("disabled-for-segments", () => (
              <span>
                Set <b>{payload.flag.name}</b> as <b>disabled</b> only for
              </span>
            ))
            .otherwise(() => null)}
          initialValue={initialSegments}
          onSubmit={handleSegments}
          disabled={pending}
        />
      )}
    </CommandDialog>
  );
}

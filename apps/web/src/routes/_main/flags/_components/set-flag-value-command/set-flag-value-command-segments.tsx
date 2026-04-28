import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useController, useForm } from "react-hook-form";
import z from "zod";
import { useTRPC } from "@/lib/trpc.ts";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command.tsx";
import { Kbd } from "@/ui/kbd.tsx";

const formSchema = z.object({
  segmentIds: z.set(z.string()).min(1, "Pick at least one segment"),
});

type FormValues = z.infer<typeof formSchema>;

interface SetFlagValueCommandSegmentsProps {
  heading: ReactNode;
  initialValue: ReadonlySet<string>;
  onSubmit: (values: ReadonlySet<string>) => void;
  disabled?: boolean;
}

export function SetFlagValueCommandSegments({
  heading,
  initialValue,
  onSubmit,
  disabled,
}: SetFlagValueCommandSegmentsProps) {
  const trpc = useTRPC();
  const { data: segments } = useSuspenseQuery(trpc.segments.list.queryOptions());

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      segmentIds: new Set(initialValue),
    },
  });

  const selected = useController({
    name: "segmentIds",
    control: form.control,
  });

  const submit = form.handleSubmit((values) => {
    onSubmit(values.segmentIds);
  });

  return (
    <Command
      key="select-segments"
      className="focus-within:outline-none"
      tabIndex={0}
      autoFocus
      onKeyDown={(e) => {
        if (disabled) return;

        if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();
          void submit();
        }
      }}
    >
      <CommandInput placeholder="Search segments..." autoFocus disabled={disabled} />

      <CommandList>
        <CommandEmpty>No segments found</CommandEmpty>
        <CommandGroup heading={heading}>
          {segments.map((segment) => {
            const checked = selected.field.value.has(segment.id);

            return (
              <CommandItem
                key={segment.id}
                data-checked={checked ? "true" : undefined}
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === "Space") {
                    const newValue = new Set(selected.field.value);
                    selected.field.value.has(segment.id)
                      ? newValue.delete(segment.id)
                      : newValue.add(segment.id);

                    selected.field.onChange(newValue);
                  }
                }}
                onSelect={() => {
                  const newValue = new Set(selected.field.value);
                  selected.field.value.has(segment.id)
                    ? newValue.delete(segment.id)
                    : newValue.add(segment.id);

                  selected.field.onChange(newValue);
                }}
              >
                <span>{segment.name ?? `[${segment.id}]`}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <div className="border-t border-border px-3 py-2 text-xxs text-muted-foreground">
          {selected.fieldState.error ? (
            <span className="text-destructive">{selected.fieldState.error.message}</span>
          ) : (
            <>
              {selected.field.value.size} {selected.field.value.size === 1 ? "segment" : "segments"}{" "}
              selected · <Kbd className="text-xxs">Enter</Kbd> to toggle ·{" "}
              <Kbd className="text-xxs">⇧ Enter</Kbd> to save
            </>
          )}
        </div>
      </CommandList>
    </Command>
  );
}

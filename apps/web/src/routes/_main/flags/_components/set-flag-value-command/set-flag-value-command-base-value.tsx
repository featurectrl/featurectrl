import type { ReactNode } from "react";
import { Command, CommandGroup, CommandItem, CommandList, CommandNoInput } from "@/ui/command.tsx";
import type { FlagBaseValue } from "./utils.ts";

interface SetFlagValueCommandBaseValueProps {
  onSubmit: (value: FlagBaseValue) => void;
  heading: ReactNode;
  disabled?: boolean;
}

export function SetFlagValueCommandBaseValue({
  heading,
  onSubmit,
  disabled,
}: SetFlagValueCommandBaseValueProps) {
  const submit = (value: string) => {
    onSubmit(value as FlagBaseValue);
  };

  return (
    <Command shouldFilter={false}>
      <CommandNoInput />
      <CommandList>
        <CommandGroup heading={heading}>
          <CommandItem
            value={"enabled" satisfies FlagBaseValue}
            onSelect={submit}
            disabled={disabled}
          >
            <span aria-hidden className="text-brand">
              ●
            </span>
            <span>Enabled</span>
          </CommandItem>
          <CommandItem
            value={"enabled-for-segments" satisfies FlagBaseValue}
            onSelect={submit}
            disabled={disabled}
          >
            <span aria-hidden className="text-brand">
              ◐
            </span>
            <span>Enabled only for...</span>
          </CommandItem>
          <CommandItem
            value={"disabled" satisfies FlagBaseValue}
            onSelect={submit}
            disabled={disabled}
          >
            <span aria-hidden className="text-brand">
              ○
            </span>
            <span>Disabled</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

import { FlagIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/ui/empty.tsx";

interface FlagsEmptyProps {
  className?: string;
}

export function FlagsEmpty({ className }: FlagsEmptyProps) {
  return (
    <Empty className={cn("border bg-card ring-1 ring-foreground/10", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FlagIcon />
        </EmptyMedia>
        <EmptyTitle>No feature flags yet</EmptyTitle>
        <EmptyDescription>
          Flags are submitted from your codebase. Once your apps report them, they'll appear here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

import { UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/ui/empty.tsx";

interface SegmentsEmptyProps {
  className?: string;
}

export function SegmentsEmpty({ className }: SegmentsEmptyProps) {
  return (
    <Empty className={cn("border bg-card ring-1 ring-foreground/10", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UsersIcon />
        </EmptyMedia>
        <EmptyTitle>No segments yet</EmptyTitle>
        <EmptyDescription>
          Segments group your users so you can target them from feature flag values. Create one from
          your codebase to see it here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

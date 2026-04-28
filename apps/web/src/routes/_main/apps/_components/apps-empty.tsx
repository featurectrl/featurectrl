import { LayoutGridIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/ui/empty.tsx";

interface AppsSectionEmptyProps {
  className?: string;
}

export function AppsEmpty({ className }: AppsSectionEmptyProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LayoutGridIcon />
        </EmptyMedia>
        <EmptyTitle>No apps yet</EmptyTitle>
        <EmptyDescription>
          Apps are reported from your codebase. Once an app submits a flag or segment, it will show
          up here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

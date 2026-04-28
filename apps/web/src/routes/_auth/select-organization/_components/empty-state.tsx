import { Link } from "@tanstack/react-router";
import { BuildingIcon } from "lucide-react";
import { buttonVariants } from "@/ui/button.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/ui/empty.tsx";

export function EmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BuildingIcon />
        </EmptyMedia>
        <EmptyTitle>No organizations yet</EmptyTitle>
        <EmptyDescription>
          Create one to get started. You can invite teammates later.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link
          to="/create-organization"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Create organization
        </Link>
      </EmptyContent>
    </Empty>
  );
}

import { BuildingIcon, Loader2Icon } from "lucide-react";
import type { Organization } from "@/lib/auth";

type OrganizationRowProps = {
  organization: Organization;
  isDisabled: boolean;
  isLoading: boolean;
  onSelect: () => void;
};

export function OrganizationRow({
  organization,
  isDisabled,
  isLoading,
  onSelect,
}: OrganizationRowProps) {
  return (
    <button
      type="button"
      className="w-full cursor-pointer justify-between border border-border rounded-lg flex items-center gap-4 py-1 px-4 hover:bg-neutral-100"
      disabled={isDisabled || isLoading}
      onClick={onSelect}
    >
      <BuildingIcon className="shrink size-4 text-muted-foreground" />

      <span className="grow flex flex-col items-start text-left">
        <span className="text-sm font-medium">{organization.name}</span>
        <span className="text-xs text-muted-foreground">@{organization.slug}</span>
      </span>
      {isLoading && <Loader2Icon className="size-4 animate-spin" />}
    </button>
  );
}

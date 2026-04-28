import { FilterIcon, SearchIcon } from "lucide-react";
import type { App } from "@/lib/trpc.types";
import { Input } from "@/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select.tsx";

const ALL_APPS = "__all__";

interface FlagsTopbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  apps: readonly Pick<App, "id" | "name">[];
  appId: string | null;
  onAppIdChange: (appId: string | null) => void;
}

export function FlagsTopbar({
  query,
  onQueryChange,
  apps,
  appId,
  onAppIdChange,
}: FlagsTopbarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-72">
        <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search flag key…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-7 pl-8 pr-8 text-xs"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 font-mono text-xxs text-muted-foreground">
          /
        </kbd>
      </div>
      <Select
        value={appId ?? ALL_APPS}
        onValueChange={(v) => onAppIdChange(v === null || v === ALL_APPS ? null : v)}
      >
        <SelectTrigger size="sm">
          <FilterIcon className="size-3.5" />
          <SelectValue>
            {(value) =>
              value === ALL_APPS || value === null
                ? "All apps"
                : (apps.find((a) => a.id === value)?.name ?? "All apps")
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_APPS}>All apps</SelectItem>
          {apps.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

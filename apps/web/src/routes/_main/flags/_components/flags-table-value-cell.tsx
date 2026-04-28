import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { match, P } from "ts-pattern";
import { useTRPC } from "@/lib/trpc.ts";
import type { FeatureFlag } from "@/lib/trpc.types";
import { cn } from "@/lib/utils.ts";
import { Badge } from "@/ui/badge.tsx";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/ui/hover-card.tsx";

type FlagValue = FeatureFlag["values"][number]["value"];

interface FlagsTableValueCellProps {
  flag: FeatureFlag;
  value: FlagValue | undefined;
  onEdit: () => void;
}

export function FlagsTableValueCell({ flag, value, onEdit }: FlagsTableValueCellProps) {
  const trpc = useTRPC();
  const { data: segments } = useSuspenseQuery(trpc.segments.list.queryOptions());
  const { base, exceptionSegments } = useMemo(() => {
    const [base, exceptionSegmentIds] = match<FlagValue | undefined, [boolean, readonly string[]]>(
      value,
    )
      .with(undefined, () => [false, []] as const)
      .with({ enabled: true }, (v) => [true, v.disabled?.segments ?? []] as const)
      .with({ enabled: false }, () => [false, []] as const)
      .with({ enabled: { segments: P.array() } }, (v) => [false, v.enabled.segments] as const)
      .exhaustive();

    const segmentsMap = new Map(segments.map((segment) => [segment.id, segment]));

    return {
      base,
      exceptionSegments: exceptionSegmentIds.map((segmentId) => segmentsMap.get(segmentId)),
    };
  }, [value, segments]);

  const isPartial = exceptionSegments.length > 0;

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <button
            type="button"
            onClick={onEdit}
            className="-my-1 -mx-2 cursor-pointer text-xxs px-2 py-1 rounded-sm hover:bg-muted"
          />
        }
      >
        <span aria-hidden className="text-xs text-brand">
          {isPartial ? "◐" : base ? "●" : "○"}
        </span>{" "}
        <span
          className={cn(
            "font-semibold tracking-wider uppercase",
            base ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {isPartial ? (base ? "Off for some users" : "On for some users") : base ? "On" : "Off"}
        </span>
      </HoverCardTrigger>

      <HoverCardContent className="w-64 p-0 py-3" sideOffset={6}>
        <p className="px-3 pb-2 text-sm tracking-wider text-foreground">
          <Badge variant="outline">{flag.name}</Badge> is {base ? "enabled" : "disabled"} for
          everyone
          {exceptionSegments.length > 0 && ", except:"}
        </p>

        <ul className="flex flex-col">
          {exceptionSegments.map((segment) => {
            if (!segment) {
              return null;
            }

            return (
              <li key={segment.id} className="flex items-center gap-2 px-3 text-sm">
                <span aria-hidden className="size-1.5 rounded-full bg-muted-foreground/60" />
                <span className="text-foreground">{segment.name ?? segment.id}</span>
              </li>
            );
          })}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}

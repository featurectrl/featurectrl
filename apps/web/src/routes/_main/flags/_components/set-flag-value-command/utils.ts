import { match, P } from "ts-pattern";
import type { FeatureFlag } from "@/lib/trpc.types";

type FlagValue = FeatureFlag["values"][number]["value"];

export type FlagBaseValue =
  | "enabled"
  | "disabled"
  | "enabled-for-segments"
  | "disabled-for-segments";

export type SegmentBase = Extract<FlagBaseValue, `${string}-for-segments`>;

export function isSegmentBase(base: FlagBaseValue): base is SegmentBase {
  return base === "enabled-for-segments" || base === "disabled-for-segments";
}

export function buildFlagValue(base: FlagBaseValue, segments: ReadonlySet<string>): FlagValue {
  switch (base) {
    case "enabled":
      return { enabled: true };
    case "disabled":
      return { enabled: false };
    case "enabled-for-segments":
      return { enabled: { segments: [...segments] } };
    case "disabled-for-segments":
      return { enabled: true, disabled: { segments: [...segments] } };
  }
}

export function initialSegmentsFromValue(value: FlagValue | undefined): ReadonlySet<string> {
  return match(value)
    .with({ enabled: true, disabled: { segments: P.nonNullable } }, (v) => {
      return new Set(v.disabled.segments);
    })
    .with({ enabled: { segments: P.nonNullable } }, (v) => {
      return new Set(v.enabled.segments);
    })
    .with(undefined, { enabled: P.boolean }, () => {
      return new Set<string>();
    })
    .exhaustive();
}

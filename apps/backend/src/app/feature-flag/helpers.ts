import type { FeatureFlagValue } from "@/db/schema";

export function extractSegmentsFromFeatureFlagValue(value: FeatureFlagValue) {
  if (value.enabled === true) {
    return value.disabled?.segments ?? [];
  } else if (value.enabled === false) {
    return [];
  } else {
    return value.enabled.segments;
  }
}

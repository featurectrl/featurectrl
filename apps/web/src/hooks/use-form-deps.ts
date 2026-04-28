/** biome-ignore-all lint/correctness/useExhaustiveDependencies: it's a custom hook to automatically reset form when dependencies change */

import type React from "react";
import { useEffect } from "react";
import type { DefaultValues, FieldValues, UseFormReturn } from "react-hook-form";

export function useFormDeps<T extends FieldValues>(
  form: UseFormReturn<T>,
  deps: React.DependencyList,
  {
    defaultValues,
  }: {
    defaultValues?: DefaultValues<T>;
  } = {},
) {
  useEffect(() => {
    form.reset(defaultValues);
  }, deps);
}

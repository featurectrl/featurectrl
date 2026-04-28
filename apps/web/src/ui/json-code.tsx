import { lazy, Suspense, useMemo } from "react";
import { cn } from "@/lib/utils.ts";

const importJsonCodeLazy = async () => {
  const { JsonCodeLazy } = await import("./json-code.lazy");
  return { default: JsonCodeLazy };
};
const JsonCodeLazy = lazy(importJsonCodeLazy);

interface JsonCodeProps {
  value: unknown;
  className?: string;
}

export function JsonCode({ value, className }: JsonCodeProps) {
  const json = useMemo(() => JSON.stringify(value, null, 2), [value]);

  const wrapperClass = cn(
    "overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed",
    className,
  );

  return (
    <Suspense
      fallback={
        <pre className={cn(wrapperClass, "text-muted-foreground")}>
          <code>{json}</code>
        </pre>
      }
    >
      <JsonCodeLazy className={wrapperClass} json={json} />
    </Suspense>
  );
}

JsonCode.preload = () => {
  void importJsonCodeLazy();
};

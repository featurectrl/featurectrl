import clsx from "clsx";
import type { ReactNode } from "react";

interface HeadingProps {
  className?: string;
  children: ReactNode;
}

export function Heading({ className, children }: HeadingProps) {
  return (
    <h2
      className={clsx(
        "p-0 m-0 text-2xl font-semibold tracking-tight leading-tight text-stone-900",
        className,
      )}
    >
      {children}
    </h2>
  );
}

import clsx from "clsx";
import type { ReactNode } from "react";
import { Heading as HeadingPrimitive } from "react-email";

type HeadingProps = {
  className?: string;
  children: ReactNode;
};

export function Heading({ className, children }: HeadingProps) {
  return (
    <HeadingPrimitive
      className={clsx(
        "p-0 m-0 text-2xl font-semibold tracking-tight leading-tight text-stone-900",
        className,
      )}
    >
      {children}
    </HeadingPrimitive>
  );
}

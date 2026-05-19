import clsx from "clsx";
import type { ReactNode } from "react";

interface TextProps {
  muted?: boolean;
  size?: "xs" | "sm" | "base" | "2xl";
  className?: string;
  children: ReactNode;
}

export function Text({ children, className, muted, size = "base" }: TextProps) {
  return (
    <p
      className={clsx(
        "m-0",
        {
          "text-stone-500": muted,
          "text-stone-700": !muted,
          "text-xs": size === "xs",
          "text-sm": size === "sm",
          "text-base": size === "base",
        },
        className,
      )}
    >
      {children}
    </p>
  );
}

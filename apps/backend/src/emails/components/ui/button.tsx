import clsx from "clsx";
import type { ReactNode } from "react";

interface ButtonProps {
  href: string;
  className?: string;
  children: ReactNode;
}

const BASE_STYLE = {
  display: "inline-block",
  lineHeight: "100%",
  textDecoration: "none",
} as const;

export function Button({ href, className, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={BASE_STYLE}
      className={clsx(
        "bg-blue-700 text-white no-underline font-medium px-6 py-4 rounded-md tracking-tight",
        className,
      )}
    >
      {children}
    </a>
  );
}

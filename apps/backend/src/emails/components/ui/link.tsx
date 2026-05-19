import clsx from "clsx";
import type { ReactNode } from "react";

interface LinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export function Link({ href, className, children }: LinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx("text-blue-700 no-underline", className)}
    >
      {children}
    </a>
  );
}

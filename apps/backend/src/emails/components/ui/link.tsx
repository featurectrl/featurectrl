import clsx from "clsx";
import type { ReactNode } from "react";
import { Link as LinkPrimitive } from "react-email";

type LinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function Link({ href, className, children }: LinkProps) {
  return (
    <LinkPrimitive href={href} className={clsx("text-blue-700 no-underline", className)}>
      {children}
    </LinkPrimitive>
  );
}

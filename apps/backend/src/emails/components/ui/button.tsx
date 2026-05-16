import clsx from "clsx";
import type { ReactNode } from "react";
import { Button as ButtonPrimitive } from "react-email";

type ButtonProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function Button({ href, className, children }: ButtonProps) {
  return (
    <ButtonPrimitive
      href={href}
      className={clsx(
        "bg-blue-700 text-white no-underline font-medium px-6 py-4 rounded-md tracking-tight",
        className,
      )}
    >
      {children}
    </ButtonPrimitive>
  );
}

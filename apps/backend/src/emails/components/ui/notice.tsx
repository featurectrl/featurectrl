import clsx from "clsx";
import type { ReactNode } from "react";
import { Section } from "./section";

interface NoticeProps {
  className?: string;
  children: ReactNode;
}

export function Notice({ className, children }: NoticeProps) {
  return (
    <Section
      className={clsx(
        "bg-stone-50 border border-solid border-stone-200 border-l-4 border-l-stone-400 rounded p-3",
        className,
      )}
    >
      {children}
    </Section>
  );
}

import type { CSSProperties, ReactNode } from "react";
import { colors } from "@/emails/theming";

interface LinkProps {
  href: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Link({ href, style, children }: LinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...styles.root, ...style }}>
      {children}
    </a>
  );
}

const styles = {
  root: {
    color: colors.blue["700"],
    textDecoration: "none",
  },
} as const satisfies Record<string, CSSProperties>;

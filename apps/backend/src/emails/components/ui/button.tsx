import type { CSSProperties, ReactNode } from "react";
import { colors } from "@/emails/theming";

interface ButtonProps {
  href: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Button({ href, style, children }: ButtonProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...styles.root, ...style }}>
      {children}
    </a>
  );
}

const styles = {
  root: {
    display: "inline-block",
    lineHeight: "100%",
    textDecoration: "none",
    background: colors.blue["500"],
    color: colors.white,
    fontWeight: 500,
    letterSpacing: "-0.025em",
    paddingLeft: "24px",
    paddingRight: "24px",
    paddingTop: "16px",
    paddingBottom: "16px",
    borderRadius: "8px",
  },
} as const satisfies Record<string, CSSProperties>;

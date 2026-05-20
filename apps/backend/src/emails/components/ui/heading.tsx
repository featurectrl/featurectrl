import type { CSSProperties, ReactNode } from "react";
import { colors, lineHeight, textSize } from "@/emails/theming";

interface HeadingProps {
  style?: CSSProperties;
  children: ReactNode;
}

export function Heading({ style, children }: HeadingProps) {
  return <h2 style={{ ...styles.root, ...style }}>{children}</h2>;
}

const styles = {
  root: {
    margin: 0,
    padding: 0,
    fontSize: textSize["2xl"],
    lineHeight: lineHeight.tight,
    fontWeight: 600,
    letterSpacing: "-0.025em",
    color: colors.stone["900"],
  },
} as const satisfies Record<string, CSSProperties>;

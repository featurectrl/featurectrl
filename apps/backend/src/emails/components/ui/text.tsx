import type { CSSProperties, ReactNode } from "react";
import { colors, textSize } from "@/emails/theming";

interface TextProps {
  muted?: boolean;
  size?: "xs" | "sm" | "base" | "2xl";
  style?: CSSProperties;
  children: ReactNode;
}

export function Text({ children, style, muted = false, size = "base" }: TextProps) {
  return (
    <p
      style={{
        ...styles.root,
        fontSize: textSize[size],
        ...(muted ? styles.muted : styles.normal),
        ...style,
      }}
    >
      {children}
    </p>
  );
}

const styles = {
  root: {
    margin: 0,
  },
  normal: {
    color: colors.stone["700"],
  },
  muted: {
    color: colors.stone["500"],
  },
} as const satisfies Record<string, CSSProperties>;

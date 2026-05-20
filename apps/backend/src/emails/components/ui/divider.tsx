import type { CSSProperties } from "react";
import { colors } from "@/emails/theming";

interface DividerProps {
  dashed?: boolean;
  style?: CSSProperties;
}

export function Divider({ dashed = false, style }: DividerProps) {
  return (
    <hr
      style={{
        ...styles.root,
        ...(dashed ? styles.dashed : {}),
        ...style,
      }}
    />
  );
}

const styles = {
  root: {
    border: "none",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: colors.stone["200"],
  },

  dashed: {
    borderTopStyle: "dashed",
  },
} as const satisfies Record<string, CSSProperties>;

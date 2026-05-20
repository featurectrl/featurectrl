import type { CSSProperties, ReactNode } from "react";
import { colors } from "@/emails/theming";
import { Section } from "./section";

interface NoticeProps {
  style?: CSSProperties;
  children: ReactNode;
}

export function Notice({ style, children }: NoticeProps) {
  return <Section style={{ ...styles.root, ...style }}>{children}</Section>;
}

const styles = {
  root: {
    backgroundColor: colors.stone["50"],
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.stone["200"],
    borderLeftWidth: "4px",
    borderLeftColor: colors.stone["400"],
    borderRadius: "4px",
    padding: "12px",
  },
} as const satisfies Record<string, CSSProperties>;

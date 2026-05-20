import type { CSSProperties } from "react";

interface PreviewProps {
  children: string;
}

const PADDING = " ‌ ".repeat(40);

export function Preview({ children }: PreviewProps) {
  return (
    <div style={styles.root}>
      {children}
      {PADDING}
    </div>
  );
}

const styles = {
  root: {
    display: "none",
    overflow: "hidden",
    lineHeight: "1px",
    opacity: 0,
    maxHeight: 0,
    maxWidth: 0,
  },
} as const satisfies Record<string, CSSProperties>;

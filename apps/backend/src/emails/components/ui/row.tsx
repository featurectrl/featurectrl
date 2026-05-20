import type { CSSProperties, ReactNode } from "react";

interface RowProps {
  style?: CSSProperties;
  children: ReactNode;
}

export function Row({ style, children }: RowProps) {
  return (
    <table
      align="center"
      width="100%"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      style={style}
    >
      <tbody style={styles.body}>
        <tr style={styles.row}>{children}</tr>
      </tbody>
    </table>
  );
}

const styles = {
  body: {
    width: "100%",
  },
  row: {
    width: "100%",
  },
} as const satisfies Record<string, CSSProperties>;

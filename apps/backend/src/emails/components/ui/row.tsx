import type { CSSProperties, ReactNode } from "react";

interface RowProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Row({ className, style, children }: RowProps) {
  return (
    <table
      align="center"
      width="100%"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      className={className}
      style={style}
    >
      <tbody style={{ width: "100%" }}>
        <tr style={{ width: "100%" }}>{children}</tr>
      </tbody>
    </table>
  );
}

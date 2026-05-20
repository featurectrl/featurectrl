import type { CSSProperties, ReactNode } from "react";

interface ColumnProps {
  align?: "left" | "center" | "right";
  valign?: "top" | "middle" | "bottom";
  style?: CSSProperties;
  children: ReactNode;
}

export function Column({ align, valign, style, children }: ColumnProps) {
  return (
    <td align={align} valign={valign} style={style}>
      {children}
    </td>
  );
}

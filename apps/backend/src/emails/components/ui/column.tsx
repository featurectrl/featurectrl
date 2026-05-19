import type { CSSProperties, ReactNode } from "react";

interface ColumnProps {
  align?: "left" | "center" | "right";
  valign?: "top" | "middle" | "bottom";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Column({ align, valign, className, style, children }: ColumnProps) {
  return (
    <td align={align} valign={valign} className={className} style={style}>
      {children}
    </td>
  );
}

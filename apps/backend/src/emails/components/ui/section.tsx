import type { CSSProperties, ReactNode } from "react";

interface SectionProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Section({ className, style, children }: SectionProps) {
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
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

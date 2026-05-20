import type { CSSProperties, ReactNode } from "react";

interface SectionProps {
  style?: CSSProperties;
  children: ReactNode;
}

export function Section({ style, children }: SectionProps) {
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
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

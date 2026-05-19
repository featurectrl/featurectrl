import type { CSSProperties, ReactNode } from "react";

interface ContainerProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Container({ className, style, children }: ContainerProps) {
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
        <tr style={{ width: "100%" }}>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

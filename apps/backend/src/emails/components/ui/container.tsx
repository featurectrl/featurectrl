import type { CSSProperties, ReactNode } from "react";

interface ContainerProps {
  style?: CSSProperties;
  children: ReactNode;
}

export function Container({ style, children }: ContainerProps) {
  return (
    <table
      align="center"
      width="100%"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      style={{ ...styles.root, ...style }}
    >
      <tbody>
        <tr style={styles.row}>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

const styles = {
  root: {},
  row: {
    width: "100%",
  },
} as const satisfies Record<string, CSSProperties>;

import type { CSSProperties } from "react";

interface ImgProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
}

export function Img({ src, alt, width, height, style }: ImgProps) {
  return (
    <img src={src} alt={alt} width={width} height={height} style={{ ...styles.root, ...style }} />
  );
}

const styles = {
  root: {
    display: "block",
    outline: "none",
    border: "none",
    textDecoration: "none",
  },
} as const satisfies Record<string, CSSProperties>;

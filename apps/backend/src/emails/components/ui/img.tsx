import type { CSSProperties } from "react";

interface ImgProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}

const BASE_STYLE: CSSProperties = {
  display: "block",
  outline: "none",
  border: "none",
  textDecoration: "none",
};

export function Img({ src, alt, width, height, className, style }: ImgProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ ...BASE_STYLE, ...style }}
    />
  );
}

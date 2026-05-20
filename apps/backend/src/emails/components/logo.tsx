import type { CSSProperties } from "react";
import { useImage } from "../shared/assets-provider";
import { Img } from "./ui/img";

interface LogoProps {
  style?: CSSProperties;
}

export function Logo({ style }: LogoProps) {
  const src = useImage("./logo-full.svg");

  return <Img alt="featurectrl logo" src={src} style={style} />;
}

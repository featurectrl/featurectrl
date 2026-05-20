import type { CSSProperties } from "react";
import imageSource from "../assets/logo-full.svg?dataurl";
import { Img } from "./ui/img";

interface LogoProps {
  style?: CSSProperties;
}

export function Logo({ style }: LogoProps) {
  return <Img alt="featurectrl logo" src={imageSource} style={style} />;
}

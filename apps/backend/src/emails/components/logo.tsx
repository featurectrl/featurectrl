import type { CSSProperties } from "react";
import imageSource from "../assets/logo-full.svg" with { loader: "dataurl" };
import { Img } from "./ui/img";

const imageSourceDataUrl = imageSource as string;

interface LogoProps {
  style?: CSSProperties;
}

export function Logo({ style }: LogoProps) {
  return <Img alt="featurectrl logo" src={imageSourceDataUrl} style={style} />;
}

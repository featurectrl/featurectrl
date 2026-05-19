import { useImage } from "../shared/assets-provider";
import { Img } from "./ui/img";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const src = useImage("./logo-full.svg");

  return <Img alt="featurectrl logo" src={src} className={className} />;
}

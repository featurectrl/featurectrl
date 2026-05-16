import { useImage } from "../shared/assets-provider";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  const src = useImage("./logo-full.svg");

  return <img alt="featurectrl logo" src={src} className={className} />;
}

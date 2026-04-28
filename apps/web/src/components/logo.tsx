import LogoImage from "@/assets/logo.svg";
import LogoFullImage from "@/assets/logo_full.svg";

const imageVariants = {
  icon: LogoImage,
  full: LogoFullImage,
} as const;

export interface LogoProps {
  variant: keyof typeof imageVariants;
  className?: string;
}

export function Logo({ variant, className }: LogoProps) {
  const image = imageVariants[variant];

  return <img src={image} alt="featurectrl" className={className} />;
}

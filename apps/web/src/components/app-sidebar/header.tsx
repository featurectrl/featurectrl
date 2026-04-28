import { Logo } from "@/components/logo.tsx";

export function Header() {
  return (
    <div className="flex items-center select-none gap-2 px-2">
      <Logo variant="icon" className="h-6 w-6" />
      <span className="text-sm font-medium text-foreground">featurectrl</span>
    </div>
  );
}

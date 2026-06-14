import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/ui/button.tsx";
import { Input } from "@/ui/input.tsx";

interface CopyableKeyProps {
  id: string;
  value: string;
}

export function CopyableKey({ id, value }: CopyableKeyProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <Input id={id} value={value} readOnly className="font-mono text-xs" />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={handleCopy}
        aria-label="Copy to clipboard"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  );
}

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/ui/button.tsx";
import { Field, FieldDescription, FieldLabel } from "@/ui/field.tsx";
import { Input } from "@/ui/input.tsx";

interface ApiKeySecretsViewProps {
  publicKey: string;
  privateKey: string;
}

export function ApiKeySecretsView({ publicKey, privateKey }: ApiKeySecretsViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <FieldDescription>
        Save these keys now — the private key won't be shown again after you close this dialog.
      </FieldDescription>

      <Field>
        <FieldLabel htmlFor="reveal-public-key">Public key</FieldLabel>
        <SecretField id="reveal-public-key" value={publicKey} />
      </Field>

      <Field>
        <FieldLabel htmlFor="reveal-private-key">Private key</FieldLabel>
        <SecretField id="reveal-private-key" value={privateKey} />
      </Field>
    </div>
  );
}

interface SecretFieldProps {
  id: string;
  value: string;
}

function SecretField({ id, value }: SecretFieldProps) {
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

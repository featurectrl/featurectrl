import { Field, FieldDescription, FieldLabel } from "@/ui/field.tsx";
import { CopyableKey } from "../keys/copyable-key.tsx";

interface ApiKeySecretViewProps {
  secretKey: string;
}

export function ApiKeySecretView({ secretKey }: ApiKeySecretViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <FieldDescription>
        Secret key won't be shown again after you close this dialog. Ensure that you save it
        somewhere.
      </FieldDescription>

      <Field>
        <FieldLabel htmlFor="reveal-secret-key">Secret key</FieldLabel>
        <CopyableKey id="reveal-secret-key" value={secretKey} />
      </Field>
    </div>
  );
}

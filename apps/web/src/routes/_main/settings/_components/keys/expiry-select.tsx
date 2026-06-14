import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select.tsx";

export const EXPIRY_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "365 days" },
  { value: "never", label: "Never" },
] as const;

export type ExpiryValue = (typeof EXPIRY_OPTIONS)[number]["value"];

// The create UI defaults both key types to a one-year expiry.
export const DEFAULT_EXPIRY: ExpiryValue = "365";

export function expiryToDays(value: ExpiryValue): 30 | 90 | 365 | null {
  return value === "never" ? null : (Number(value) as 30 | 90 | 365);
}

interface ExpirySelectProps {
  id?: string;
  value: ExpiryValue;
  onValueChange: (value: ExpiryValue) => void;
  disabled?: boolean;
}

export function ExpirySelect({ id, value, onValueChange, disabled }: ExpirySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as ExpiryValue)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue>{(v) => EXPIRY_OPTIONS.find((o) => o.value === v)?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {EXPIRY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

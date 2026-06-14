import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { cn } from "@/lib/utils";

interface KeyExpiryProps {
  expiresAt: Date | null;
}

export function KeyExpiry({ expiresAt }: KeyExpiryProps) {
  if (expiresAt === null) {
    return <span className="shrink-0 text-xs text-muted-foreground">Never expires</span>;
  }

  const date = new Date(expiresAt);
  const expired = date.getTime() <= Date.now();

  return (
    <span
      className={cn("shrink-0 text-sm", expired ? "text-destructive" : "text-muted-foreground")}
    >
      {expired ? "Expired" : `Expires ${formatDistanceToNow(date, { addSuffix: true })}`}
    </span>
  );
}

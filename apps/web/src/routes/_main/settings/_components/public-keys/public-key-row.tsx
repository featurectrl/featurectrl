import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  MoreVerticalIcon,
  PencilIcon,
  RefreshCwIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { WidgetListItem } from "@/components/widget.tsx";
import type { PublicKey } from "@/lib/trpc.types";
import { Button } from "@/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";
import { KeyExpiry } from "../keys/key-expiry.tsx";

interface PublicKeyRowProps {
  publicKey: PublicKey;

  onRename: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
}

export function PublicKeyRow({ publicKey, onRename, onRegenerate, onDelete }: PublicKeyRowProps) {
  return (
    <WidgetListItem>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium">{publicKey.displayName}</span>
        <PublicKeyValue value={publicKey.key} masked={publicKey.keyMasked} />
      </div>

      <KeyExpiry expiresAt={publicKey.expiresAt} />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="More actions">
              <MoreVerticalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem onClick={onRename}>
            <PencilIcon /> Change name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRegenerate}>
            <RefreshCwIcon /> Regenerate key
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <TrashIcon /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </WidgetListItem>
  );
}

interface PublicKeyValueProps {
  value: string;
  masked: string;
}

function PublicKeyValue({ value, masked }: PublicKeyValueProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
      <span className="truncate">{revealed ? value : masked}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-5"
        onClick={() => setRevealed((v) => !v)}
        aria-label={revealed ? "Hide public key" : "Reveal public key"}
      >
        {revealed ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-5"
        onClick={handleCopy}
        aria-label="Copy to clipboard"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </span>
  );
}

export function PublicKeyRowSkeleton() {
  return (
    <WidgetListItem>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="h-5 flex items-center">
          <Skeleton className="h-4 w-full max-w-24" />
        </div>
        <Skeleton className="h-4 w-full max-w-48" />
      </div>
      <Skeleton className="h-4 w-24 shrink-0" />
    </WidgetListItem>
  );
}

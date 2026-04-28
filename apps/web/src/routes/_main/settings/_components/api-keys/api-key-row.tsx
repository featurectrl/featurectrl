import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { MoreVerticalIcon, RefreshCwIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { WidgetListItem } from "@/components/widget.tsx";
import { useTRPC } from "@/lib/trpc.ts";
import type { ApiKey } from "@/lib/trpc.types";
import { Button } from "@/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu.tsx";
import { Input } from "@/ui/input.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";

const formSchema = z.object({
  displayName: z.string().min(1, "Required").max(100, "Too long"),
});

type FormValues = z.infer<typeof formSchema>;

interface ApiKeyRowProps {
  apiKey: ApiKey;

  onRegenerate: () => void;
  onDelete: () => void;
}

export function ApiKeyRow({ apiKey, onRegenerate, onDelete }: ApiKeyRowProps) {
  const created = formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true });

  return (
    <WidgetListItem>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <ApiKeyDisplayNameEditor apiKey={apiKey} />
        <span className="flex items-center gap-3 truncate font-mono text-xs text-muted-foreground">
          <span>{apiKey.publicKeyMasked}</span>
          <span>{apiKey.privateKeyMasked}</span>
        </span>
      </div>

      <span className="shrink-0 text-xs text-muted-foreground">Created {created}</span>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="More actions">
              <MoreVerticalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRegenerate}>
            <RefreshCwIcon /> Regenerate keys
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <TrashIcon /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </WidgetListItem>
  );
}

interface ApiKeyDisplayNameEditorProps {
  apiKey: Pick<ApiKey, "id" | "displayName">;
}

function ApiKeyDisplayNameEditor({ apiKey }: ApiKeyDisplayNameEditorProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { displayName: apiKey.displayName },
  });

  useEffect(() => {
    form.reset({ displayName: apiKey.displayName });
  }, [apiKey.displayName, form]);

  const updateMutation = useMutation(
    trpc.apiKeys.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.apiKeys.list.queryFilter());
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = form.handleSubmit((values) => {
    if (values.displayName === apiKey.displayName) {
      setIsEditing(false);
      return;
    }
    updateMutation.mutate({ id: apiKey.id, displayName: values.displayName });
  });

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="w-fit truncate rounded text-left text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {apiKey.displayName}
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex">
      <Input
        autoFocus
        autoComplete="off"
        disabled={updateMutation.isPending}
        className="h-7 max-w-xs text-sm font-medium"
        {...form.register("displayName")}
        onBlur={onSubmit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            form.reset({ displayName: apiKey.displayName });
            setIsEditing(false);
          }
        }}
      />
    </form>
  );
}

export function ApiKeyRowSkeleton() {
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

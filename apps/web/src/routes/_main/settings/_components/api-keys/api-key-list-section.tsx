import { useSuspenseQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";
import {
  Widget,
  WidgetAction,
  WidgetHeader,
  WidgetHeaderText,
  WidgetList,
  WidgetTitle,
} from "@/components/widget.tsx";
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { useTRPC } from "@/lib/trpc.ts";
import type { ApiKey } from "@/lib/trpc.types";
import { Button } from "@/ui/button.tsx";
import { DialogTrigger } from "@/ui/dialog.tsx";
import { ApiKeyRow, ApiKeyRowSkeleton } from "./api-key-row.tsx";
import { ChangeApiKeyNameDialog } from "./change-api-key-name-dialog.tsx";
import { CreateApiKeyDialog } from "./create-api-key-dialog.tsx";
import { DeleteApiKeyDialog } from "./delete-api-key-dialog.tsx";
import { RegenerateApiKeyDialog } from "./regenerate-api-key-dialog.tsx";

export function ApiKeyListSection() {
  return (
    <Suspense fallback={<ApiKeyListSectionSkeleton />}>
      <ApiKeyListSectionWithQuery />
    </Suspense>
  );
}

export function ApiKeyListSectionWithQuery() {
  const trpc = useTRPC();
  const createDialogHandle = useDialogHandle();
  const changeNameDialogHandle = useDialogHandle<{ apiKey: ApiKey }>();
  const regenerateDialogHandle = useDialogHandle<{ apiKey: ApiKey }>();
  const deleteDialogHandle = useDialogHandle<{ apiKey: ApiKey }>();
  const { data: apiKeys } = useSuspenseQuery(trpc.apiKeys.list.queryOptions());

  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>API keys</WidgetTitle>
        </WidgetHeaderText>
        <WidgetAction>
          <DialogTrigger handle={createDialogHandle} render={<Button size="sm" />}>
            <PlusIcon /> Generate
          </DialogTrigger>
        </WidgetAction>
      </WidgetHeader>

      {apiKeys.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">No API keys yet.</p>
      ) : (
        <WidgetList>
          {apiKeys.map((key) => (
            <ApiKeyRow
              key={key.id}
              apiKey={key}
              onRename={() => changeNameDialogHandle.openWithPayload({ apiKey: key })}
              onRegenerate={() => regenerateDialogHandle.openWithPayload({ apiKey: key })}
              onDelete={() => deleteDialogHandle.openWithPayload({ apiKey: key })}
            />
          ))}
        </WidgetList>
      )}

      <CreateApiKeyDialog handle={createDialogHandle} />
      <ChangeApiKeyNameDialog handle={changeNameDialogHandle} />
      <RegenerateApiKeyDialog handle={regenerateDialogHandle} />
      <DeleteApiKeyDialog handle={deleteDialogHandle} />
    </Widget>
  );
}

export function ApiKeyListSectionSkeleton() {
  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>API keys</WidgetTitle>
        </WidgetHeaderText>
        <WidgetAction>
          <Button size="sm" disabled>
            <PlusIcon /> Generate
          </Button>
        </WidgetAction>
      </WidgetHeader>

      <WidgetList>
        <ApiKeyRowSkeleton />
        <ApiKeyRowSkeleton />
      </WidgetList>
    </Widget>
  );
}

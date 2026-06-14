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
import type { PublicKey } from "@/lib/trpc.types";
import { Button } from "@/ui/button.tsx";
import { DialogTrigger } from "@/ui/dialog.tsx";
import { ChangePublicKeyNameDialog } from "./change-public-key-name-dialog.tsx";
import { CreatePublicKeyDialog } from "./create-public-key-dialog.tsx";
import { DeletePublicKeyDialog } from "./delete-public-key-dialog.tsx";
import { PublicKeyRow, PublicKeyRowSkeleton } from "./public-key-row.tsx";
import { RegeneratePublicKeyDialog } from "./regenerate-public-key-dialog.tsx";

export function PublicKeyListSection() {
  return (
    <Suspense fallback={<PublicKeyListSectionSkeleton />}>
      <PublicKeyListSectionWithQuery />
    </Suspense>
  );
}

export function PublicKeyListSectionWithQuery() {
  const trpc = useTRPC();
  const createDialogHandle = useDialogHandle();
  const changeNameDialogHandle = useDialogHandle<{ publicKey: PublicKey }>();
  const regenerateDialogHandle = useDialogHandle<{ publicKey: PublicKey }>();
  const deleteDialogHandle = useDialogHandle<{ publicKey: PublicKey }>();
  const { data: publicKeys } = useSuspenseQuery(trpc.publicKeys.list.queryOptions());

  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Public keys</WidgetTitle>
        </WidgetHeaderText>
        <WidgetAction>
          <DialogTrigger handle={createDialogHandle} render={<Button size="sm" />}>
            <PlusIcon /> Generate
          </DialogTrigger>
        </WidgetAction>
      </WidgetHeader>

      {publicKeys.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">No public keys yet.</p>
      ) : (
        <WidgetList>
          {publicKeys.map((key) => (
            <PublicKeyRow
              key={key.id}
              publicKey={key}
              onRename={() => changeNameDialogHandle.openWithPayload({ publicKey: key })}
              onRegenerate={() => regenerateDialogHandle.openWithPayload({ publicKey: key })}
              onDelete={() => deleteDialogHandle.openWithPayload({ publicKey: key })}
            />
          ))}
        </WidgetList>
      )}

      <CreatePublicKeyDialog handle={createDialogHandle} />
      <ChangePublicKeyNameDialog handle={changeNameDialogHandle} />
      <RegeneratePublicKeyDialog handle={regenerateDialogHandle} />
      <DeletePublicKeyDialog handle={deleteDialogHandle} />
    </Widget>
  );
}

export function PublicKeyListSectionSkeleton() {
  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Public keys</WidgetTitle>
        </WidgetHeaderText>
        <WidgetAction>
          <Button size="sm" disabled>
            <PlusIcon /> Generate
          </Button>
        </WidgetAction>
      </WidgetHeader>

      <WidgetList>
        <PublicKeyRowSkeleton />
        <PublicKeyRowSkeleton />
      </WidgetList>
    </Widget>
  );
}

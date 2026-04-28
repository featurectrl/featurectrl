import { useSuspenseQuery } from "@tanstack/react-query";
import { PlusIcon, Settings2Icon } from "lucide-react";
import { Suspense, useState } from "react";
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
import type { Environment } from "@/lib/trpc.types";
import { Button } from "@/ui/button.tsx";
import { DialogTrigger } from "@/ui/dialog.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu.tsx";
import { ArchiveEnvironmentDialog } from "./archive-environment-dialog.tsx";
import { CreateEnvironmentDialog } from "./create-environment-dialog.tsx";
import { DeleteEnvironmentDialog } from "./delete-environment-dialog.tsx";
import { EditEnvironmentDialog } from "./edit-environment-dialog.tsx";
import { EnvironmentRow, EnvironmentRowSkeleton } from "./environment-row.tsx";
import { RestoreEnvironmentDialog } from "./restore-environment-dialog.tsx";

export function EnvironmentListSection() {
  return (
    <Suspense fallback={<EnvironmentListSectionSkeleton />}>
      <EnvironmentListSectionWithQuery />
    </Suspense>
  );
}

export function EnvironmentListSectionWithQuery() {
  const trpc = useTRPC();
  const createDialogHandle = useDialogHandle();
  const editDialogHandle = useDialogHandle<{ environment: Environment }>();
  const archiveDialogHandle = useDialogHandle<{ environment: Environment }>();
  const restoreDialogHandle = useDialogHandle<{ environment: Environment }>();
  const deleteDialogHandle = useDialogHandle<{ environment: Environment }>();
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data: environments } = useSuspenseQuery(
    trpc.environments.list.queryOptions({ includeArchived }),
  );

  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Environments</WidgetTitle>
        </WidgetHeaderText>
        <WidgetAction>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Environment list options">
                  <Settings2Icon />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuCheckboxItem
                checked={includeArchived}
                onCheckedChange={setIncludeArchived}
                closeOnClick={false}
              >
                Show archived
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogTrigger handle={createDialogHandle} render={<Button size="sm" />}>
            <PlusIcon /> New environment
          </DialogTrigger>
        </WidgetAction>
      </WidgetHeader>

      {environments.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">No environments yet.</p>
      ) : (
        <WidgetList>
          {environments.map((env) => (
            <EnvironmentRow
              key={env.id}
              environment={env}
              onEdit={() => editDialogHandle.openWithPayload({ environment: env })}
              onArchive={() => archiveDialogHandle.openWithPayload({ environment: env })}
              onRestore={() => restoreDialogHandle.openWithPayload({ environment: env })}
              onDelete={() => deleteDialogHandle.openWithPayload({ environment: env })}
            />
          ))}
        </WidgetList>
      )}

      <CreateEnvironmentDialog handle={createDialogHandle} />
      <EditEnvironmentDialog handle={editDialogHandle} />
      <ArchiveEnvironmentDialog handle={archiveDialogHandle} />
      <RestoreEnvironmentDialog handle={restoreDialogHandle} />
      <DeleteEnvironmentDialog handle={deleteDialogHandle} />
    </Widget>
  );
}

export function EnvironmentListSectionSkeleton() {
  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Environments</WidgetTitle>
        </WidgetHeaderText>
        <WidgetAction>
          <Button variant="ghost" size="icon-sm" disabled>
            <Settings2Icon />
          </Button>

          <Button size="sm" disabled>
            <PlusIcon /> New environment
          </Button>
        </WidgetAction>
      </WidgetHeader>

      <WidgetList>
        <EnvironmentRowSkeleton />
        <EnvironmentRowSkeleton />
      </WidgetList>
    </Widget>
  );
}

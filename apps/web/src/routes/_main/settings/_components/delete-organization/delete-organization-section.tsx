import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  Widget,
  WidgetBody,
  WidgetHeader,
  WidgetHeaderText,
  WidgetTitle,
} from "@/components/widget.tsx";
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { type Organization, useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import { DeleteOrganizationConfirmationDialog } from "./delete-organization-confirmation-dialog.tsx";

export function DeleteOrganizationSection() {
  return (
    <Suspense fallback={<DeleteOrganizationSectionSkeleton />}>
      <DeleteOrganizationSectionWithQuery />
    </Suspense>
  );
}

export function DeleteOrganizationSectionWithQuery() {
  const betterAuth = useBetterAuth();
  const deleteDialogHandle = useDialogHandle<{ organization: Organization }>();

  const { data: organization } = useSuspenseQuery(
    betterAuth.organization.getFullOrganization.queryOptions(),
  );

  if (!organization) {
    return null;
  }

  return (
    <Widget variant="danger">
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Danger zone</WidgetTitle>
        </WidgetHeaderText>
      </WidgetHeader>
      <WidgetBody>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Delete this organization</span>
            <span className="text-xs text-muted-foreground">
              Permanently removes all flags, environments, members and data.
            </span>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteDialogHandle.openWithPayload({ organization })}
          >
            Delete organization
          </Button>
        </div>
      </WidgetBody>

      <DeleteOrganizationConfirmationDialog handle={deleteDialogHandle} />
    </Widget>
  );
}

export function DeleteOrganizationSectionSkeleton() {
  return (
    <Widget variant="danger">
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Danger zone</WidgetTitle>
        </WidgetHeaderText>
      </WidgetHeader>
      <WidgetBody>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Delete this organization</span>
            <span className="text-xs text-muted-foreground">
              Permanently removes all flags, environments, members and data.
            </span>
          </div>

          <Button variant="destructive" disabled>
            Delete organization
          </Button>
        </div>
      </WidgetBody>
    </Widget>
  );
}

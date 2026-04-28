import { useSuspenseQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Suspense, useMemo } from "react";
import {
  Widget,
  WidgetAction,
  WidgetHeader,
  WidgetHeaderText,
  WidgetList,
  WidgetTitle,
} from "@/components/widget.tsx";
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { type Invitation, type Member, useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import { DialogTrigger } from "@/ui/dialog.tsx";
import { CancelInvitationDialog } from "./cancel-invitation-dialog.tsx";
import { InvitationRow } from "./invitation-row.tsx";
import { InviteMemberDialog } from "./invite-member-dialog.tsx";
import { MemberRow, MemberRowSkeleton } from "./member-row.tsx";
import { RemoveMemberDialog } from "./remove-member-dialog.tsx";

export function MemberListSection() {
  return (
    <Suspense fallback={<MemberListSectionSkeleton />}>
      <MemberListSectionWithQuery />
    </Suspense>
  );
}

export function MemberListSectionWithQuery() {
  const betterAuth = useBetterAuth();
  const inviteDialogHandle = useDialogHandle();
  const removeDialogHandle = useDialogHandle<{ member: Member }>();
  const cancelInvitationDialogHandle = useDialogHandle<{ invitation: Invitation }>();

  const { data: organization } = useSuspenseQuery(
    betterAuth.organization.getFullOrganization.queryOptions(),
  );

  const members = organization?.members ?? [];
  const invitations = organization?.invitations ?? [];

  const pendingInvitations: Invitation[] = useMemo(() => {
    return invitations.filter((invite) => invite.status === "pending");
  }, [invitations]);

  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Members</WidgetTitle>
        </WidgetHeaderText>
        <WidgetAction>
          <DialogTrigger handle={inviteDialogHandle} render={<Button size="sm" />}>
            <PlusIcon /> Invite
          </DialogTrigger>
        </WidgetAction>
      </WidgetHeader>
      <WidgetList>
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            onRemove={() => removeDialogHandle.openWithPayload({ member })}
          />
        ))}
        {pendingInvitations.map((invitation) => (
          <InvitationRow
            key={invitation.id}
            invitation={invitation}
            onCancel={() => cancelInvitationDialogHandle.openWithPayload({ invitation })}
          />
        ))}
        {members.length === 0 && pendingInvitations.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">No members yet.</li>
        )}
      </WidgetList>

      <InviteMemberDialog handle={inviteDialogHandle} />
      <RemoveMemberDialog handle={removeDialogHandle} />
      <CancelInvitationDialog handle={cancelInvitationDialogHandle} />
    </Widget>
  );
}

export function MemberListSectionSkeleton() {
  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Members</WidgetTitle>
        </WidgetHeaderText>
        <WidgetAction>
          <Button size="sm" disabled>
            <PlusIcon /> Invite
          </Button>
        </WidgetAction>
      </WidgetHeader>

      <WidgetList>
        <MemberRowSkeleton />
        <MemberRowSkeleton />
      </WidgetList>
    </Widget>
  );
}

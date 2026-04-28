import { useSuspenseQueries } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  Widget,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetHeaderText,
  WidgetList,
  WidgetTitle,
} from "@/components/widget.tsx";
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import { RevokeOtherSessionsDialog } from "./revoke-other-sessions-dialog.tsx";
import { type SessionItem, SessionRow, SessionRowSkeleton } from "./session-row.tsx";

export function SessionListSection() {
  return (
    <Suspense fallback={<SessionListSectionSkeleton />}>
      <SessionListSectionWithQuery />
    </Suspense>
  );
}

export function SessionListSectionWithQuery() {
  const betterAuth = useBetterAuth();

  const revokeOthersDialogHandle = useDialogHandle();

  const [{ data: session }, { data: sessionList }] = useSuspenseQueries({
    queries: [betterAuth.getSession.queryOptions(), betterAuth.listSessions.queryOptions()],
  });

  const currentSessionId = session?.session.id;
  const sessions = (sessionList ?? []) as SessionItem[];
  const otherSessionsCount = sessions.filter((s) => s.id !== currentSessionId).length;

  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Sessions</WidgetTitle>
          <WidgetDescription>Devices currently signed in to your account.</WidgetDescription>
        </WidgetHeaderText>
      </WidgetHeader>

      {sessions.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">No sessions found.</p>
      ) : (
        <WidgetList>
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} isCurrent={s.id === currentSessionId} />
          ))}
        </WidgetList>
      )}

      {otherSessionsCount > 0 && (
        <WidgetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => revokeOthersDialogHandle.open(null)}
          >
            Sign out everywhere else
          </Button>
        </WidgetFooter>
      )}

      <RevokeOtherSessionsDialog handle={revokeOthersDialogHandle} />
    </Widget>
  );
}

export function SessionListSectionSkeleton() {
  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Sessions</WidgetTitle>
          <WidgetDescription>Devices currently signed in to your account.</WidgetDescription>
        </WidgetHeaderText>
      </WidgetHeader>
      <WidgetList>
        <SessionRowSkeleton />
        <SessionRowSkeleton />
      </WidgetList>
    </Widget>
  );
}

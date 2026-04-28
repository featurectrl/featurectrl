import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Suspense } from "react";
import {
  Widget,
  WidgetHeader,
  WidgetHeaderText,
  WidgetRow,
  WidgetRowLabel,
  WidgetRowLabelDescription,
  WidgetRowLabelTitle,
  WidgetRows,
  WidgetTitle,
} from "@/components/widget.tsx";
import { useDialogHandle } from "@/hooks/use-dialog-handle.ts";
import { useBetterAuth } from "@/lib/auth.ts";
import { useTRPC } from "@/lib/trpc.ts";
import { Button } from "@/ui/button.tsx";
import { DialogTrigger } from "@/ui/dialog.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";
import { ChangePasswordDialog } from "./change-password-dialog.tsx";
import {
  type ConnectedAccount,
  ConnectedAccountRow,
  ConnectedAccountRowSkeleton,
} from "./connected-account-row.tsx";

export function SecuritySection() {
  return (
    <Suspense fallback={<SecuritySectionSkeleton />}>
      <SecuritySectionWithQuery />
    </Suspense>
  );
}

export function SecuritySectionWithQuery() {
  const betterAuth = useBetterAuth();
  const trpc = useTRPC();
  const changePasswordDialogHandle = useDialogHandle();

  const { data: accountsData } = useSuspenseQuery(betterAuth.listAccounts.queryOptions());
  const { data: platformSettings } = useSuspenseQuery(trpc.settings.get.queryOptions());

  const accounts = (accountsData ?? []) as ConnectedAccount[];
  const credentialAccount = accounts.find((a) => a.providerId === "credential");
  const githubAccount = accounts.find((a) => a.providerId === "github");
  const googleAccount = accounts.find((a) => a.providerId === "google");

  const passwordDescription = credentialAccount
    ? `Last changed ${formatDistanceToNow(new Date(credentialAccount.updatedAt), {
        addSuffix: true,
      })}`
    : "No password set — sign in with a connected account";

  const githubEnabled = !!platformSettings.auth.github;
  const googleEnabled = !!platformSettings.auth.google;

  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Security</WidgetTitle>
        </WidgetHeaderText>
      </WidgetHeader>
      <WidgetRows>
        <WidgetRow>
          <WidgetRowLabel>
            <WidgetRowLabelTitle>Password</WidgetRowLabelTitle>
            <WidgetRowLabelDescription>{passwordDescription}</WidgetRowLabelDescription>
          </WidgetRowLabel>
          <div className="flex items-center justify-end">
            <DialogTrigger
              handle={changePasswordDialogHandle}
              render={<Button variant="outline" size="sm" />}
            >
              Change password
            </DialogTrigger>
          </div>
        </WidgetRow>

        {githubEnabled && <ConnectedAccountRow provider="github" account={githubAccount} />}

        {googleEnabled && <ConnectedAccountRow provider="google" account={googleAccount} />}
      </WidgetRows>

      <ChangePasswordDialog handle={changePasswordDialogHandle} />
    </Widget>
  );
}

export function SecuritySectionSkeleton() {
  return (
    <Widget>
      <WidgetHeader>
        <WidgetHeaderText>
          <WidgetTitle>Security</WidgetTitle>
        </WidgetHeaderText>
      </WidgetHeader>
      <WidgetRows>
        <WidgetRow>
          <WidgetRowLabel>
            <WidgetRowLabelTitle>Password</WidgetRowLabelTitle>
            <WidgetRowLabelDescription>
              <Skeleton className="h-3 w-40" />
            </WidgetRowLabelDescription>
          </WidgetRowLabel>
          <div className="flex items-center justify-end">
            <Button variant="outline" size="sm" disabled>
              Change password
            </Button>
          </div>
        </WidgetRow>
        <ConnectedAccountRowSkeleton />
        <ConnectedAccountRowSkeleton />
      </WidgetRows>
    </Widget>
  );
}

import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import GitHubIconImage from "@/assets/icons/github.svg";
import GoogleIconImage from "@/assets/icons/google.svg";
import {
  WidgetRow,
  WidgetRowLabel,
  WidgetRowLabelDescription,
  WidgetRowLabelTitle,
} from "@/components/widget.tsx";
import { useBetterAuth } from "@/lib/auth.ts";
import { absoluteURL } from "@/lib/urls.ts";
import { Button } from "@/ui/button.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";

export interface ConnectedAccount {
  id: string;
  providerId: string;
  accountId: string;
  updatedAt: Date | string;
}

const providers = {
  google: {
    label: "Google",
    icon: GoogleIconImage,
  },

  github: {
    label: "GitHub",
    icon: GitHubIconImage,
  },
};

interface ConnectedAccountRowProps {
  provider: keyof typeof providers;
  account: ConnectedAccount | undefined;
}

export function ConnectedAccountRow({ provider, account }: ConnectedAccountRowProps) {
  const betterAuth = useBetterAuth();
  const { label, icon } = providers[provider];
  const isConnected = !!account;

  const connectMutation = useMutation(
    betterAuth.linkSocial(provider).mutationOptions({
      onError: (error) => {
        toast.error(error.message ?? `Could not connect ${label}`);
      },
    }),
  );

  const disconnectMutation = useMutation(
    betterAuth.unlinkAccount.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        toast.success(`${label} disconnected`);
        await client.invalidateQueries({ queryKey: betterAuth.listAccounts.queryKey() });
      },
      onError: (error) => {
        toast.error(error.message ?? `Could not disconnect ${label}`);
      },
    }),
  );

  return (
    <WidgetRow>
      <WidgetRowLabel>
        <WidgetRowLabelTitle>
          <div className="flex items-center gap-2">
            <span className="flex size-4 items-center justify-center text-foreground">
              <img src={icon} alt="" className="size-4" aria-hidden={true} />
            </span>
            <span>{label}</span>
          </div>
        </WidgetRowLabelTitle>
        <WidgetRowLabelDescription>
          {isConnected ? `Connected as ${account.accountId}` : `Sign in with ${label}`}
        </WidgetRowLabelDescription>
      </WidgetRowLabel>
      <div className="flex items-center justify-end">
        {isConnected ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disconnectMutation.isPending}
            onClick={() =>
              disconnectMutation.mutate({
                providerId: provider,
                accountId: account.accountId,
              })
            }
          >
            {disconnectMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Disconnect"
            )}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={connectMutation.isPending}
            onClick={() =>
              connectMutation.mutate({
                callbackURL: absoluteURL({ to: "/profile" }),
              })
            }
          >
            {connectMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Connect"
            )}
          </Button>
        )}
      </div>
    </WidgetRow>
  );
}

export function ConnectedAccountRowSkeleton() {
  return (
    <WidgetRow>
      <WidgetRowLabel>
        <WidgetRowLabelTitle>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
        </WidgetRowLabelTitle>
        <WidgetRowLabelDescription>
          <Skeleton className="h-3 w-40" />
        </WidgetRowLabelDescription>
      </WidgetRowLabel>
      <div className="flex items-center justify-end">
        <Button type="button" size="sm" disabled>
          Connect
        </Button>
      </div>
    </WidgetRow>
  );
}

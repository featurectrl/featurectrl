import { useMutation, useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo.tsx";
import { useBetterAuth } from "@/lib/auth.ts";
import { EmptyState } from "@/routes/_auth/select-organization/_components/empty-state.tsx";
import { FieldSeparator } from "@/ui/field.tsx";
import { InvitationRow } from "./_components/invitation-row.tsx";
import { OrganizationRow } from "./_components/organization-row.tsx";

export const Route = createFileRoute("/_auth/select-organization")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(context.betterAuth.getSession.queryOptions());
    void context.queryClient.ensureQueryData(context.betterAuth.organization.list.queryOptions());
    void context.queryClient.ensureQueryData(
      context.betterAuth.organization.listUserInvitations.queryOptions(),
    );
  },

  component: SelectOrganizationPage,
});

function SelectOrganizationPage() {
  const betterAuth = useBetterAuth();
  const navigate = useNavigate();

  const [{ data: sessionData }, { data: organizations }, { data: invitations }] =
    useSuspenseQueries({
      queries: [
        betterAuth.getSession.queryOptions(),
        betterAuth.organization.list.queryOptions(),
        betterAuth.organization.listUserInvitations.queryOptions(),
      ] as const,
    });

  const session = sessionData?.session;

  const setActiveOrganization = useMutation(
    betterAuth.organization.setActive.mutationOptions({
      onSuccess: async () => {
        await navigate({ to: "/" });
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not select organization");
      },
    }),
  );

  const acceptInvitation = useMutation(
    betterAuth.organization.acceptInvitation.mutationOptions({
      onSuccess: async () => {
        await navigate({ to: "/" });
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not accept invitation");
      },
    }),
  );

  const rejectInvitation = useMutation(
    betterAuth.organization.rejectInvitation.mutationOptions({
      onSuccess: async () => {
        await navigate({ to: "/" });
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not decline organization");
      },
    }),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: must be run single time on load
  useEffect(() => {
    if (
      session &&
      !session.activeOrganizationId &&
      organizations?.length === 1 &&
      invitations?.length === 0
    ) {
      setActiveOrganization.mutate({
        organizationId: organizations[0].id,
      });
    }
  }, [session?.id]);

  const isEmpty = organizations?.length === 0 && invitations?.length === 0;

  const isPending =
    setActiveOrganization.isPending || acceptInvitation.isPending || rejectInvitation.isPending;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (sessionData && !sessionData.user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo variant="icon" className="h-10" />
        <div className="space-y-1">
          <h1 className="text-base font-semibold tracking-tight">Choose an organization</h1>
          <p className="text-sm text-muted-foreground">Pick which workspace you'd like to use</p>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-5">
          {!!organizations?.length && (
            <section className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your organizations
              </p>
              <div className="space-y-2">
                {organizations.map((organization) => {
                  const isLoading =
                    setActiveOrganization.isPending &&
                    "organizationId" in setActiveOrganization.variables &&
                    setActiveOrganization.variables.organizationId === organization.id;

                  return (
                    <OrganizationRow
                      key={organization.id}
                      organization={organization}
                      isDisabled={isPending && !isLoading}
                      isLoading={isLoading}
                      onSelect={() =>
                        setActiveOrganization.mutate({ organizationId: organization.id })
                      }
                    />
                  );
                })}
              </div>
            </section>
          )}

          {Boolean(organizations?.length && invitations?.length) && <FieldSeparator />}

          {!!invitations?.length && (
            <section className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending invitations
              </p>
              <div className="space-y-2">
                {invitations.map((invite) => {
                  const invitationId = invite.id;
                  const isLoading =
                    (acceptInvitation.isPending &&
                      acceptInvitation.variables.invitationId === invitationId) ||
                    (rejectInvitation.isPending &&
                      rejectInvitation.variables.invitationId === invitationId);

                  return (
                    <InvitationRow
                      key={invite.id}
                      invitation={invite}
                      isDisabled={isPending && !isLoading}
                      isLoading={isLoading}
                      onAccept={() => acceptInvitation.mutate({ invitationId })}
                      onDecline={() => rejectInvitation.mutate({ invitationId })}
                    />
                  );
                })}
              </div>
            </section>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Need a new workspace?{" "}
            <Link
              to="/create-organization"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Create organization
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { useBetterAuth } from "@/lib/auth.ts";
import { CreateOrganizationForm } from "./_components/create-organization-form";

export const Route = createFileRoute("/_auth/create-organization")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(context.betterAuth.getSession.queryOptions());
  },
  component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
  const betterAuth = useBetterAuth();
  const { data: sessionData, isLoading } = useQuery(betterAuth.getSession.queryOptions());

  if (!sessionData?.session && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Logo variant="icon" className="h-10" />
        <div className="space-y-1">
          <h1 className="text-base font-semibold tracking-tight">Create organization</h1>
          <p className="text-sm text-muted-foreground">Set up a workspace for you and your team</p>
        </div>
      </div>

      <CreateOrganizationForm className="mb-4" />

      <p className="text-center text-sm text-muted-foreground">
        <Link
          to="/select-organization"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Back to organizations
        </Link>
      </p>
    </div>
  );
}

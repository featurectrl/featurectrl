import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { MailCheckIcon } from "lucide-react";
import { Logo } from "@/components/logo.tsx";
import { useBetterAuth } from "@/lib/auth.ts";
import { SECOND } from "@/lib/time.ts";
import { Button } from "@/ui/button.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";
import { ResendVerificationButton } from "./_components/resend-verification-button.tsx";

export const Route = createFileRoute("/_auth/verify-email")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(context.betterAuth.getSession.queryOptions());
  },
  pendingComponent: VerifyEmailLoading,
  component: VerifyEmailPage,
});

function Header() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Logo variant="icon" className="h-10" />
      <div className="space-y-1">
        <h1 className="text-base font-semibold tracking-tight">Verify your email</h1>
      </div>
    </div>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="space-y-6">
      <Header />

      <div className="flex items-start gap-3 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        <MailCheckIcon className="mt-px size-4 shrink-0" />
        <div className="grow flex flex-col gap-1 items-stretch">
          <Skeleton className="h-4 w-full max-w-56" />
          <Skeleton className="h-4 w-full max-w-40 mb-1" />
          <Skeleton className="h-4 w-full max-w-60" />
        </div>
      </div>

      <Button type="button" size="lg" className="w-full" disabled>
        Resend verification email
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Wrong account?{" "}
        <button
          type="button"
          disabled
          className="text-foreground underline-offset-4 hover:underline disabled:opacity-50"
        >
          Sign out
        </button>
      </p>
    </div>
  );
}

function VerifyEmailPage() {
  const betterAuth = useBetterAuth();
  const navigate = useNavigate();
  const { data: sessionData, isStale } = useSuspenseQuery(
    betterAuth.getSession.queryOptions(undefined, {
      refetchInterval: 5 * SECOND,
    }),
  );

  const signOut = useMutation(
    betterAuth.signOut.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        client.setQueryData(betterAuth.getSession.queryKey(), null);
        await navigate({ to: "/login", replace: true });
      },
    }),
  );

  if (isStale) {
    return <VerifyEmailLoading />;
  }

  if (!sessionData?.session) {
    return <Navigate to="/login" replace />;
  }

  if (sessionData.user.emailVerified) {
    if (!sessionData.session.activeOrganizationId) {
      return <Navigate to="/select-organization" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="space-y-6">
      <Header />

      <div className="flex items-start gap-3 rounded-md border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
        <MailCheckIcon className="mt-px size-4 shrink-0" />
        <div className="grow flex flex-col gap-1">
          <p>
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{sessionData.user.email}</span>.
          </p>

          <p>Click the link in the email to continue.</p>
        </div>
      </div>

      <ResendVerificationButton email={sessionData.user.email} />

      <p className="text-center text-sm text-muted-foreground">
        Wrong account?{" "}
        <button
          type="button"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="text-foreground underline-offset-4 hover:underline disabled:opacity-50"
        >
          Sign out
        </button>
      </p>
    </div>
  );
}

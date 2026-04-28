import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { z } from "zod";
import { useBetterAuth } from "@/lib/auth.ts";
import { ResetPasswordForm } from "./_components/reset-password-form";

export const Route = createFileRoute("/_auth/reset-password")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(context.betterAuth.getSession.queryOptions());
  },
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const betterAuth = useBetterAuth();
  const { token } = Route.useSearch();

  const { data: sessionData } = useQuery(betterAuth.getSession.queryOptions());

  if (sessionData?.session) {
    return <Navigate to="/select-organization" replace />;
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-lg font-semibold tracking-tight">Invalid reset link</h1>
        <p className="text-sm text-muted-foreground">
          This link is missing a token or has expired.
        </p>
        <Link
          to="/forgot-password"
          className="inline-block text-sm text-foreground underline-offset-4 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">Choose something memorable but strong.</p>
      </div>

      <ResetPasswordForm token={token} />
    </div>
  );
}

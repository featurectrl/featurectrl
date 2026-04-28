import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useBetterAuth } from "@/lib/auth.ts";
import { ForgotPasswordForm } from "./_components/forgot-password-form.tsx";

export const Route = createFileRoute("/_auth/forgot-password")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(context.betterAuth.getSession.queryOptions());
  },
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const betterAuth = useBetterAuth();

  const { data: sessionData } = useQuery(betterAuth.getSession.queryOptions());

  const [submitted, setSubmitted] = useState<boolean>(false);

  if (sessionData?.session) {
    return <Navigate to="/select-organization" replace />;
  }

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-lg font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for that address, we've sent a link to reset your password.
        </p>
        <Link
          to="/login"
          className="inline-block text-sm text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <ForgotPasswordForm onSubmitted={() => setSubmitted(true)} />

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

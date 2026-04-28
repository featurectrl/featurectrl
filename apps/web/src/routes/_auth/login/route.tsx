import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/logo.tsx";
import { useBetterAuth } from "@/lib/auth.ts";
import { useTRPC } from "@/lib/trpc.ts";
import { SocialLoginButton } from "@/routes/_auth/login/_components/social-login-button";
import { FieldSeparator } from "@/ui/field";
import { EmailPasswordLoginForm } from "./_components/email-password-login-form";

export const Route = createFileRoute("/_auth/login")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(context.betterAuth.getSession.queryOptions());
    void context.queryClient.ensureQueryData(context.trpc.settings.get.queryOptions());
  },

  component: LoginPage,
});

function LoginPage() {
  const trpc = useTRPC();
  const betterAuth = useBetterAuth();
  const { data: sessionData } = useQuery(betterAuth.getSession.queryOptions());
  const { data: settings } = useSuspenseQuery(trpc.settings.get.queryOptions());

  const googleEnabled = settings.auth.google;
  const githubEnabled = settings.auth.github;

  const [showEmail, setShowEmail] = useState(false);

  const showForm = !(googleEnabled || githubEnabled) || showEmail;

  if (sessionData?.session) {
    return <Navigate to="/" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo variant="icon" className="h-10" />
        <div className="space-y-1">
          <h1 className="text-base font-semibold tracking-tight">Sign in to featurectrl</h1>
          <p className="text-sm text-muted-foreground">Toggle, don't deploy.</p>
        </div>
      </div>

      {(googleEnabled || googleEnabled) && (
        <div className={githubEnabled && googleEnabled ? "grid grid-cols-2 gap-2" : "space-y-2"}>
          {githubEnabled && (
            <SocialLoginButton provider="github" compact={githubEnabled && googleEnabled} />
          )}
          {googleEnabled && (
            <SocialLoginButton provider="google" compact={githubEnabled && googleEnabled} />
          )}
        </div>
      )}

      {(googleEnabled || googleEnabled) && !showEmail && (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className="block w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Sign in with email
        </button>
      )}

      {showForm && (googleEnabled || googleEnabled) && <FieldSeparator>or</FieldSeparator>}

      {showForm && <EmailPasswordLoginForm />}

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/sign-up" className="text-foreground underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

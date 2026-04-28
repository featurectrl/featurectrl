import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Logo } from "@/components/logo.tsx";
import { useBetterAuth } from "@/lib/auth.ts";
import { useTRPC } from "@/lib/trpc.ts";
import { SocialLoginButton } from "@/routes/_auth/login/_components/social-login-button.tsx";
import { FieldSeparator } from "@/ui/field";
import { SignUpForm } from "./_components/sign-up-form";

export const Route = createFileRoute("/_auth/sign-up")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(context.betterAuth.getSession.queryOptions());
    void context.queryClient.ensureQueryData(context.trpc.settings.get.queryOptions());
  },
  component: SignUpPage,
});

function SignUpPage() {
  const trpc = useTRPC();
  const betterAuth = useBetterAuth();
  const { data: sessionData } = useQuery(betterAuth.getSession.queryOptions());
  const { data: settings } = useSuspenseQuery(trpc.settings.get.queryOptions());

  const hasBoth = Boolean(settings.auth.github && settings.auth.google);
  const hasSocial = Boolean(settings.auth.github || settings.auth.google);

  if (sessionData?.session) {
    return <Navigate to="/" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo variant="icon" className="h-10" />
        <div className="space-y-1">
          <h1 className="text-base font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">Get started in less than a minute</p>
        </div>
      </div>

      {hasSocial && (
        <>
          <div className={hasBoth ? "grid grid-cols-2 gap-2" : "space-y-2"}>
            {settings.auth.github && <SocialLoginButton provider="github" compact={hasBoth} />}
            {settings.auth.google && <SocialLoginButton provider="google" compact={hasBoth} />}
          </div>

          <FieldSeparator>or</FieldSeparator>
        </>
      )}

      <SignUpForm />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

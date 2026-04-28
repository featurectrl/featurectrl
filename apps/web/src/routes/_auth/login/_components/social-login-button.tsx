import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import GitHubIconImage from "@/assets/icons/github.svg";
import GoogleIconImage from "@/assets/icons/google.svg";
import { useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";

const providers = {
  google: {
    label: "Google" as string,
    icon: GoogleIconImage,
  },

  github: {
    label: "GitHub" as string,
    icon: GitHubIconImage,
  },
} as const;

interface SocialSignInButtonProps {
  provider: keyof typeof providers;
  compact?: boolean;
}

export function SocialLoginButton({ provider, compact }: SocialSignInButtonProps) {
  const betterAuth = useBetterAuth();
  const { label, icon } = providers[provider];

  const signInUsingSocial = useMutation(
    betterAuth.signIn.social(provider).mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries({
          queryKey: betterAuth.getSession.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Sign-in failed");
      },
    }),
  );

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full justify-center"
      onClick={() => {
        signInUsingSocial.mutate({
          callbackURL: "/select-organization",
        });
      }}
      disabled={signInUsingSocial.isPending}
    >
      {signInUsingSocial.isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <img src={icon} alt="" className="size-4" aria-hidden={true} />
      )}
      <span>{compact ? label : `Continue with ${label}`}</span>
    </Button>
  );
}

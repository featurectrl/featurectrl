import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useBetterAuth } from "@/lib/auth.ts";
import { absoluteURL } from "@/lib/urls.ts";
import { Button } from "@/ui/button.tsx";

interface ResendVerificationButtonProps {
  email: string;
}

export function ResendVerificationButton({ email }: ResendVerificationButtonProps) {
  const betterAuth = useBetterAuth();

  const sendVerificationEmail = useMutation(
    betterAuth.sendVerificationEmail.mutationOptions({
      onSuccess: () => {
        toast.success("Verification link sent. Check your inbox.");
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not send verification email");
      },
    }),
  );

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={sendVerificationEmail.isPending}
      onClick={() =>
        sendVerificationEmail.mutate({
          email,
          callbackURL: absoluteURL({ to: "/select-organization" }),
        })
      }
    >
      {sendVerificationEmail.isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        "Resend verification email"
      )}
    </Button>
  );
}

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRightIcon, LogOutIcon } from "lucide-react";
import { useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";

export function ProfileLogoutSection() {
  const betterAuth = useBetterAuth();
  const navigate = useNavigate();

  const signOut = useMutation(
    betterAuth.signOut.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries();
        await navigate({ to: "/login" });
      },
    }),
  );

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button variant="outline" onClick={() => navigate({ to: "/select-organization" })}>
        <ArrowLeftRightIcon />
        Switch organization
      </Button>
      <Button variant="outline" onClick={() => signOut.mutate()}>
        <LogOutIcon />
        Logout
      </Button>
    </div>
  );
}

export function ProfileLogoutSectionSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-9 w-24" />
    </div>
  );
}

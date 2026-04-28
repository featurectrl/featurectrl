import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { toast } from "sonner";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar.tsx";
import { Widget, WidgetBody } from "@/components/widget.tsx";
import { useBetterAuth } from "@/lib/auth.ts";
import { Button } from "@/ui/button.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";

export function ProfileHeaderSection() {
  return (
    <Suspense fallback={<ProfileHeaderSectionSkeleton />}>
      <ProfileHeaderSectionWithQuery />
    </Suspense>
  );
}

export function ProfileHeaderSectionWithQuery() {
  const betterAuth = useBetterAuth();

  const { data: session } = useSuspenseQuery(betterAuth.getSession.queryOptions());

  const removeMutation = useMutation(
    betterAuth.updateUser.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        await client.invalidateQueries({
          queryKey: betterAuth.getSession.queryKey(),
        });
        toast.success("Photo removed");
      },
      onError: (error) => {
        toast.error(error.message ?? "Could not remove photo");
      },
    }),
  );

  if (!session) {
    return null;
  }

  const { user } = session;

  const displayName = (user.name || user.email).trim();

  return (
    <Widget>
      <WidgetBody className="flex-row items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-semibold">{displayName}</span>
          <span className="truncate text-sm text-muted-foreground">{user.email}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toast.info("Photo upload is not yet supported.")}
          >
            Upload photo
          </Button>
          {user.image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate({ image: null })}
            >
              {removeMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </Button>
          )}
        </div>
      </WidgetBody>
    </Widget>
  );
}

export function ProfileHeaderSectionSkeleton() {
  return (
    <Widget>
      <WidgetBody className="flex-row items-center gap-4">
        <UserAvatarSkeleton size="lg" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>

        <Button type="button" variant="outline" size="sm" disabled>
          Upload photo
        </Button>
      </WidgetBody>
    </Widget>
  );
}

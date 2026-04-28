import type { User } from "better-auth";
import { useMemo } from "react";
import { cn, getInitials, hashedIndex } from "@/lib/utils.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar.tsx";
import { Skeleton } from "@/ui/skeleton.tsx";

const PALETTE = [
  "bg-gradient-to-br from-orange-400 to-pink-500",
  "bg-gradient-to-br from-blue-400 to-indigo-500",
  "bg-gradient-to-br from-emerald-400 to-teal-500",
  "bg-gradient-to-br from-violet-400 to-fuchsia-500",
  "bg-gradient-to-br from-sky-400 to-cyan-500",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-rose-400 to-pink-500",
  "bg-gradient-to-br from-teal-400 to-cyan-500",
];

const SIZES: Record<"sm" | "base" | "lg", { avatar: string; text: string }> = {
  sm: { avatar: "size-8", text: "text-xs" },
  base: { avatar: "size-10", text: "text-sm" },
  lg: { avatar: "size-14", text: "text-lg" },
};

interface UserAvatarProps {
  user: Pick<User, "id" | "name" | "email" | "image">;
  size?: keyof typeof SIZES;
}

export function UserAvatar({ user, size = "base" }: UserAvatarProps) {
  const displayName = (user.name || user.email || "").trim();
  const fallbackBg = useMemo(() => {
    return PALETTE[hashedIndex(user.id, PALETTE.length)];
  }, [user.id]);
  const { avatar: avatarSize, text: textSize } = SIZES[size];

  return (
    <Avatar className={avatarSize}>
      {user.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
      <AvatarFallback className={cn(fallbackBg, "font-medium text-white", textSize)}>
        {getInitials(user.name || user.email || "")}
      </AvatarFallback>
    </Avatar>
  );
}

interface UserAvatarSkeletonProps {
  size?: keyof typeof SIZES;
}

export function UserAvatarSkeleton({ size = "base" }: UserAvatarSkeletonProps) {
  const { avatar: avatarSize } = SIZES[size];
  return <Skeleton className={cn(avatarSize, "rounded-full")} />;
}

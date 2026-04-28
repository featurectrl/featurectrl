import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftRightIcon, ChevronsUpDownIcon, LogOutIcon, UserIcon } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { type User, useBetterAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

export function ProfileDropdown({ user }: { user: User }) {
  const betterAuth = useBetterAuth();
  const navigate = useNavigate();

  const signOut = useMutation(
    betterAuth.signOut.mutationOptions({
      onSuccess: async (_data, _vars, _, { client }) => {
        client.setQueryData(betterAuth.getSession.queryKey(), null);
        await navigate({ to: "/login", replace: true });
      },
    }),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-ring data-popup-open:bg-sidebar-accent"
          />
        }
      >
        <UserAvatar user={user} size="sm" />

        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <div className="truncate text-sm text-foreground font-medium">{user.name}</div>
          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
        </div>
        <ChevronsUpDownIcon className="ml-auto size-4 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuItem
          disabled={signOut.isPending}
          className="h-8 gap-2 p-2"
          render={<Link to="/profile" />}
        >
          <UserIcon />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={signOut.isPending}
          className="h-8 gap-2 p-2"
          render={<Link to="/select-organization" />}
        >
          <ArrowLeftRightIcon />
          <span>Switch organization</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="h-8 gap-2 p-2"
          disabled={signOut.isPending}
          onClick={() => signOut.mutate()}
        >
          <LogOutIcon />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar.tsx";
import { Logo } from "@/components/logo";
import { useBetterAuth } from "@/lib/auth";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/ui/empty";
import { SidebarInset, SidebarProvider } from "@/ui/sidebar";
import { Spinner } from "@/ui/spinner";

export const Route = createFileRoute("/_main")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(context.betterAuth.getSession.queryOptions());
  },
  pendingMs: 500,
  pendingComponent: Loading,
  component: Layout,
  notFoundComponent: NotFound,
});

function Loading() {
  return (
    <div className="bg-content-background h-dvh flex flex-col justify-center items-center gap-4">
      <Logo variant="full" className="h-12" />

      <div className="text-center text-base text-muted-foreground flex items-center gap-2">
        <Spinner className="size-4" />
        Loading
      </div>
    </div>
  );
}

function Layout() {
  const betterAuth = useBetterAuth();
  const { data: session } = useSuspenseQuery(betterAuth.getSession.queryOptions());

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!session?.session.activeOrganizationId) {
    return <Navigate to="/select-organization" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar session={session} />

      <SidebarInset className="bg-content-background pt-12">
        <AppTopbar />

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function NotFound() {
  const { pathname } = useLocation();
  return (
    <div className="h-full flex flex-col justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>Page {pathname} doesn't exist.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p>
            Return to <Link to="/">home page</Link>
          </p>
        </EmptyContent>
      </Empty>
    </div>
  );
}

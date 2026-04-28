import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/_auth")({
  pendingComponent: Loading,
  component: Layout,
});

function Loading() {
  return <Root />;
}

function Layout() {
  return (
    <Root>
      <div
        className={"animate-in fade-in slide-in-from-top-5 duration-300 relative w-full max-w-sm"}
      >
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8">
          <Outlet />
        </div>
      </div>
    </Root>
  );
}

function Root({ children }: { children?: ReactNode }) {
  return (
    <main
      className="relative min-h-screen flex items-center justify-center bg-background px-4 py-10 overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(1200px 600px at 70% -10%, var(--color-brand-soft), transparent 60%), radial-gradient(900px 500px at -10% 110%, var(--color-brand-soft), transparent 60%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-border opacity-40 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      {children}
    </main>
  );
}

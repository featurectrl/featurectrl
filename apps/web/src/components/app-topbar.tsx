import { AppBreadcrumbs } from "@/components/app-breadcrumbs.tsx";
import { createSlot } from "@/components/slot.tsx";

export function AppTopbar() {
  return (
    <header className="fixed top-0 left-0 md:left-(--sidebar-width) right-0 z-10 flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <AppBreadcrumbs />

      <AppTopbar.RightArea.Target />
    </header>
  );
}

AppTopbar.RightArea = createSlot("topbar");

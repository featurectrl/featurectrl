import { Header } from "@/components/app-sidebar/header.tsx";
import { Menu } from "@/components/app-sidebar/menu.tsx";
import { ProfileDropdown } from "@/components/app-sidebar/profile-dropdown.tsx";
import type { Session } from "@/lib/auth";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/ui/sidebar";

interface AppSidebarProps {
  session: Session;
}

export function AppSidebar({ session }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="h-12 justify-center">
        <Header />
      </SidebarHeader>
      <SidebarContent>
        <Menu />
      </SidebarContent>
      <SidebarFooter>
        <ProfileDropdown user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

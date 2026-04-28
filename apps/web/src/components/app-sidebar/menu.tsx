import { Link, useRouterState } from "@tanstack/react-router";
import { FlagIcon, LayoutGridIcon, SettingsIcon, UsersIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/ui/sidebar";

export function Menu() {
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={currentPath === "/flags"} render={<Link to="/flags" />}>
                <FlagIcon />
                <span>Feature Flags</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={currentPath === "/segments"}
                render={<Link to="/segments" />}
              >
                <UsersIcon />
                <span>Segments</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={currentPath === "/apps"} render={<Link to="/apps" />}>
                <LayoutGridIcon />
                <span>Apps</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={currentPath === "/settings"}
                render={<Link to="/settings" />}
              >
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

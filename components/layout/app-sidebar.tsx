"use client";

import * as React from "react";
import { ViewSidebarLeftIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { dashboardNavConfig } from "../../lib/dashboard-nav-config";
import type { DashboardNavGroup } from "../../lib/dashboard-nav-config";
import { Logo } from "../certilys-ui/logo";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const sidebarUser = {
  name: "murgo",
  email: "m@example.com",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=murgo",
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navConfig?: DashboardNavGroup[];
}

export function AppSidebar({ navConfig = dashboardNavConfig, ...props }: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="h-svh overflow-hidden"
      {...props}
    >
      <SidebarHeader className="px-3 pt-3 pb-2">
        <div className="flex h-14 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden group-data-[collapsible=icon]:justify-center">
            <Logo
              variant={state === "collapsed" ? "collapsed" : "sidebar"}
              width={state === "collapsed" ? 52 : 132}
              height={state === "collapsed" ? 52 : 44}
              className="max-w-full"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label={
              state === "collapsed" ? "Developper le menu" : "Reduire le menu"
            }
            title={
              state === "collapsed" ? "Developper le menu" : "Reduire le menu"
            }
            className="shrink-0 group-data-[collapsible=icon]:hidden"
          >
            <HugeiconsIcon
              icon={ViewSidebarLeftIcon}
              size={18}
              strokeWidth={1.5}
              className={cn(
                "transition-transform duration-200 ease-in-out",
                state === "collapsed" && "rotate-180",
              )}
            />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-1 px-1 pb-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        {navConfig.map((group, index) => (
          <NavMain
            key={group.label}
            items={group.items}
            label={group.label}
            className={index > 0 ? "pt-1 group-data-[collapsible=icon]:pt-0" : undefined}
          />
        ))}
      </SidebarContent>
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
          <NavUser user={sidebarUser} />
        </SidebarGroup>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Developper le menu"
          title="Developper le menu"
          className="mx-auto hidden group-data-[collapsible=icon]:inline-flex group-data-[collapsible=icon]:size-8"
        >
          <HugeiconsIcon
            icon={ViewSidebarLeftIcon}
            size={20}
            strokeWidth={1.5}
            className="rotate-180"
          />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

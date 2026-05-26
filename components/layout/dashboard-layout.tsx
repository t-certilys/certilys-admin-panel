"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "../certilys-ui/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { BottomDrawer } from "./bottom-drawer";
import { BottomNav } from "./bottom-nav";
import { dashboardNavConfig, type DashboardNavGroup } from "@/lib/dashboard-nav-config";

interface DashboardLayoutProps {
  children: ReactNode;
  navConfig?: DashboardNavGroup[];
}

export function DashboardLayout({ children, navConfig = dashboardNavConfig }: DashboardLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "15rem",
            "--header-height": "calc(var(--spacing) * 12)",
          } as CSSProperties
        }
        className="h-svh overflow-hidden"
      >
        <AppSidebar navConfig={navConfig} />
        <SidebarInset className="h-svh overflow-y-auto rounded-none shadow-none">
          <SiteHeader />
          <main className="flex flex-1 flex-col overflow-x-hidden pb-20 md:pb-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <BottomNav onMoreClick={() => setIsDrawerOpen(true)} navConfig={navConfig} />
      <BottomDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navConfig={navConfig}
      />
    </TooltipProvider>
  );
}

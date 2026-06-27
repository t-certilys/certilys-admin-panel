"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "../certilys-ui/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { BottomDrawer } from "./bottom-drawer";
import { BottomNav } from "./bottom-nav";
import { dashboardNavConfig, type DashboardNavGroup } from "@/lib/dashboard-nav-config";

type DashboardUser = {
  displayName?: string | null;
  email: string;
  avatarUrl?: string | null;
};

interface DashboardLayoutProps {
  children: ReactNode;
  navConfig?: DashboardNavGroup[];
  user?: DashboardUser;
}

export function DashboardLayout({
  children,
  navConfig = dashboardNavConfig,
  user,
}: DashboardLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const sidebarUser = {
    name: user?.displayName?.trim() || user?.email.split("@")[0] || "Admin",
    email: user?.email ?? "admin@certilys.com",
    avatar: user?.avatarUrl ?? null,
  };

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
        <AppSidebar navConfig={navConfig} user={sidebarUser} />
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

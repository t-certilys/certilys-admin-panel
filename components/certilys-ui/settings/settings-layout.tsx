"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { SettingsSidebar } from "./settings-sidebar";
import { SettingsHeader } from "./settings-header";
import { SettingsBottomNav } from "./settings-bottom-nav";
import { SettingsBottomDrawer } from "./settings-bottom-drawer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface SettingsLayoutProps {
  children: ReactNode;
  user?: {
    displayName?: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

export function SettingsLayout({ children, user }: SettingsLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--header-height": "calc(var(--spacing) * 12)",
          } as CSSProperties
        }
        className="h-svh overflow-hidden"
      >
        <SettingsSidebar variant="sidebar" />
        <SidebarInset className="min-h-svh rounded-none shadow-none">
          <SettingsHeader user={user} />
          <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
            {children}
          </main>
        </SidebarInset>
        <SettingsBottomNav onMoreClick={() => setIsDrawerOpen(true)} />
        <SettingsBottomDrawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </SidebarProvider>
    </TooltipProvider>
  );
}

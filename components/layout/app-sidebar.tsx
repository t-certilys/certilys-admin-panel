"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search01Icon, ViewSidebarLeftIcon } from "@hugeicons/core-free-icons";
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

import { useCommandPalette } from "@/components/providers/command-provider";
import { clearReviewCorrectionDrafts } from "@/lib/courses/use-review-corrections-draft";
import { logoutAdminAction } from "@/lib/auth-actions";
import { dashboardNavConfig } from "../../lib/dashboard-nav-config";
import type { DashboardNavGroup } from "../../lib/dashboard-nav-config";
import { Logo } from "../certilys-ui/logo";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

type SidebarUser = {
  name: string;
  email: string;
  avatar: string | null;
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navConfig?: DashboardNavGroup[];
  user: SidebarUser;
}

const collapsedIconButtonClassName = cn(
  "flex size-9 min-h-9 min-w-9 items-center justify-center rounded-lg",
  "bg-transparent p-0 text-white/70",
  "hover:bg-white/10 hover:text-white",
  "focus-visible:ring-2 focus-visible:ring-white/30",
);

export function AppSidebar({
  navConfig = dashboardNavConfig,
  user,
  ...props
}: AppSidebarProps) {
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();
  const { toggleSearch } = useCommandPalette();

  const isCollapsed = state === "collapsed";
  const handleLogout = React.useCallback(async () => {
    clearReviewCorrectionDrafts();
    await logoutAdminAction();
    router.replace("/auth/login");
    router.refresh();
  }, [router]);

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="h-svh overflow-visible border-none bg-transparent shadow-none"
      {...props}
    >
      <div
        className={cn(
          "sidebar-pattern flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-none shadow-none",
          isCollapsed && "items-center",
        )}
      >
        <SidebarHeader
          className={cn(
            "shrink-0 select-none",
            isCollapsed ? "w-full px-0 pb-2 pt-4" : "px-3 pb-2 pt-3",
          )}
        >
          <div
            className={cn(
              "flex h-14 w-full items-center",
              isCollapsed ? "justify-center" : "justify-center",
            )}
          >
            <div className="flex min-w-0 items-center justify-center overflow-hidden">
              <Logo
                variant={isCollapsed ? "collapsed" : "sidebar"}
                themeOverride="dark"
                width={isCollapsed ? 36 : 132}
                height={isCollapsed ? 36 : 44}
                className="max-w-full"
              />
            </div>

            {!isCollapsed ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                aria-label="Réduire le menu"
                title="Réduire le menu"
                className={cn(
                  "ml-auto shrink-0 rounded-lg text-white/70",
                  "hover:bg-white/10 hover:text-white",
                  "focus-visible:ring-2 focus-visible:ring-white/30",
                )}
              >
                <HugeiconsIcon
                  icon={ViewSidebarLeftIcon}
                  size={18}
                  strokeWidth={1.5}
                />
              </Button>
            ) : null}
          </div>

          <div
            className={cn(
              "flex w-full justify-center",
              isCollapsed ? "px-0 pt-2" : "px-0 pt-1.5",
            )}
          >
            {isCollapsed ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                className={collapsedIconButtonClassName}
                aria-label="Rechercher... (Ctrl+K)"
                title="Rechercher... (Ctrl+K)"
              >
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={19}
                  strokeWidth={1.5}
                />
              </Button>
            ) : (
              <button
                type="button"
                onClick={toggleSearch}
                className={cn(
                  "group relative flex h-9 w-full cursor-pointer items-center rounded-full",
                  "bg-white/8 px-3 text-sm text-white/70",
                  "transition-colors hover:bg-white/12 hover:text-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                )}
                aria-label="Rechercher... (Ctrl+K)"
              >
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={15}
                  strokeWidth={1.5}
                  className="mr-2 shrink-0 transition-colors"
                />

                <span className="flex-1 truncate text-left">Rechercher...</span>

                <kbd className="pointer-events-none hidden items-center gap-0.5 rounded-md bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/40 sm:inline-flex">
                  <span className="text-[9px]">Ctrl</span>K
                </kbd>
              </button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent
          className={cn(
            "min-h-0 flex-1 gap-1 pb-2 select-none",
            isCollapsed ? "w-full items-center px-0" : "px-3",
          )}
        >
          {navConfig.map((group, index) => (
            <NavMain
              key={group.label}
              items={group.items}
              label={group.label}
              className={cn(
                "w-full",
                index > 0 && !isCollapsed ? "pt-1" : undefined,
                isCollapsed && "flex flex-col items-center pt-0",
              )}
            />
          ))}
        </SidebarContent>

        <SidebarFooter
          className={cn(
            "shrink-0 select-none",
            isCollapsed
              ? "flex w-full items-center justify-center px-0 pb-4 pt-2"
              : "gap-3 p-3",
          )}
        >
          {!isCollapsed ? (
            <SidebarGroup className="p-0">
              <NavUser user={user} onLogout={handleLogout} />
            </SidebarGroup>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Développer le menu"
              title="Développer le menu"
              className={collapsedIconButtonClassName}
            >
              <HugeiconsIcon
                icon={ViewSidebarLeftIcon}
                size={19}
                strokeWidth={1.5}
                className="rotate-180"
              />
            </Button>
          )}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

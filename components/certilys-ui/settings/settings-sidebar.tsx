"use client";

import * as React from "react";
import Link from "next/link";
import { ViewSidebarLeftIcon, ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { settingsNavMain } from "../../../lib/settings-nav-config";

export function SettingsSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar
      collapsible="icon"
      className="h-svh overflow-hidden border-r"
      {...props}
    >
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.back()}
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                size={20}
                strokeWidth={1.5}
              />
              <span className="text-base font-semibold">
                Back
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.5} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={
                state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              <HugeiconsIcon
                icon={ViewSidebarLeftIcon}
                size={20}
                strokeWidth={1.5}
                className={cn(
                  "transition-transform duration-200 ease-in-out",
                  state === "collapsed" && "rotate-180",
                )}
              />
              {state === "collapsed" ? null : <span>Collapse menu</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

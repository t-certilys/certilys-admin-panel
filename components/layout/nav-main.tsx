"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
  label = "Home",
  className,
}: {
  items: {
    title: string;
    url: string;
    icon?: IconSvgElement;
    badge?: string | number;
  }[];
  label?: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className={cn("select-none p-0", className)}>
      <SidebarGroupContent className="p-0">
        <SidebarGroupLabel
          className={cn(
            "select-none px-2 text-xs font-medium text-white/45",
            "group-data-[collapsible=icon]:pointer-events-none",
            "group-data-[collapsible=icon]:sr-only",
          )}
        >
          {label}
        </SidebarGroupLabel>

        <SidebarMenu
          className={cn(
            "gap-1",
            "group-data-[collapsible=icon]:flex",
            "group-data-[collapsible=icon]:flex-col",
            "group-data-[collapsible=icon]:items-center",
          )}
        >
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem
                key={item.title}
                className={cn(
                  "relative select-none",
                  "group-data-[collapsible=icon]:flex",
                  "group-data-[collapsible=icon]:h-10",
                  "group-data-[collapsible=icon]:w-full",
                  "group-data-[collapsible=icon]:items-center",
                  "group-data-[collapsible=icon]:justify-center",
                )}
              >
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    "cursor-pointer select-none border-none text-white/80 shadow-none ring-0",
                    "hover:bg-white/10 hover:text-white",
                    "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
                    "group-data-[collapsible=icon]:m-0",
                    "group-data-[collapsible=icon]:flex",
                    "group-data-[collapsible=icon]:size-9",
                    "group-data-[collapsible=icon]:min-h-9",
                    "group-data-[collapsible=icon]:min-w-9",
                    "group-data-[collapsible=icon]:items-center",
                    "group-data-[collapsible=icon]:justify-center",
                    "group-data-[collapsible=icon]:rounded-lg",
                    "group-data-[collapsible=icon]:p-0",
                  )}
                >
                  <Link
                    href={item.url}
                    className={cn(
                      "cursor-pointer select-none",
                      "group-data-[collapsible=icon]:flex",
                      "group-data-[collapsible=icon]:size-9",
                      "group-data-[collapsible=icon]:items-center",
                      "group-data-[collapsible=icon]:justify-center",
                    )}
                  >
                    {item.icon ? (
                      <HugeiconsIcon
                        icon={item.icon}
                        size={19}
                        strokeWidth={1.5}
                        className="shrink-0"
                      />
                    ) : null}

                    <span className="truncate group-data-[collapsible=icon]:sr-only">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>

                {item.badge !== undefined && item.badge !== null ? (
                  <SidebarMenuBadge
                    className={cn(
                      "select-none border-none bg-primary font-bold text-primary-foreground",
                      "flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px]",
                      "group-data-[collapsible=icon]:absolute",
                      "group-data-[collapsible=icon]:right-1",
                      "group-data-[collapsible=icon]:top-0",
                      "group-data-[collapsible=icon]:mr-0",
                    )}
                  >
                    {item.badge}
                  </SidebarMenuBadge>
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

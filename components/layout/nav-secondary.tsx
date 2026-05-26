"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { IconSvgElement } from "@hugeicons/react"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  label,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: IconSvgElement
  }[]
  label?: string
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
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
  )
}

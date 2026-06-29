"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Logout01Icon,
  Settings03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { logoutAdminAction } from "@/lib/auth-actions"
import { settingsNavMain, backToDashboard } from "../../../lib/settings-nav-config"

interface SettingsBottomDrawerProps {
  open: boolean
  onClose: () => void
}

export function SettingsBottomDrawer({ open, onClose }: SettingsBottomDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    onClose()
    await logoutAdminAction()
    router.replace("/auth/login")
    router.refresh()
  }

  return (
    <Drawer open={open} onOpenChange={(nextOpen: boolean) => !nextOpen && onClose()}>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[78vh]">
        <DrawerHeader className="gap-3 border-b px-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 border">
              <HugeiconsIcon
                icon={Settings03Icon}
                size={20}
                strokeWidth={1.5}
                className="text-primary"
              />
            </div>
            <div className="min-w-0 text-left">
              <DrawerTitle>Settings</DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">Configuration options</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4 pb-6">
          <nav className="space-y-6 pt-4">
            <section className="space-y-1">
              <p className="px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-50">
                Configuration
              </p>
              {settingsNavMain.map((item) => (
                <DrawerClose asChild key={item.url}>
                  <Link
                    href={item.url}
                    onClick={onClose}
                    className={cn(
                      "flex items-center cursor-pointer gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                      pathname === item.url
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <HugeiconsIcon
                      icon={item.icon}
                      size={20}
                      strokeWidth={1.5}
                    />
                    <span>{item.title}</span>
                  </Link>
                </DrawerClose>
              ))}
            </section>
            
            <section className="space-y-1 border-t pt-4">
              <p className="px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-50">
                Navigation
              </p>
              <DrawerClose asChild>
                <Link
                  href={backToDashboard.url}
                  onClick={onClose}
                  className="flex items-center cursor-pointer gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <HugeiconsIcon
                    icon={backToDashboard.icon}
                    size={20}
                    strokeWidth={1.5}
                  />
                  <span>Back to Dashboard</span>
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center cursor-pointer gap-3 rounded-lg px-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-all font-medium"
                >
                  <HugeiconsIcon
                    icon={Logout01Icon}
                    size={20}
                    strokeWidth={1.5}
                  />
                  <span>Log out</span>
                </button>
              </DrawerClose>
            </section>
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

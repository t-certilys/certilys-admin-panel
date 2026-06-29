"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { logoutAdminAction } from "@/lib/auth-actions";
import { dashboardNavConfig, type DashboardNavGroup } from "../../lib/dashboard-nav-config";
import { Logo } from "../certilys-ui/logo";

interface BottomDrawerProps {
  open: boolean;
  onClose: () => void;
  navConfig?: DashboardNavGroup[];
}

export function BottomDrawer({ open, onClose, navConfig = dashboardNavConfig }: BottomDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    onClose();
    await logoutAdminAction();
    router.replace("/auth/login");
    router.refresh();
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen: boolean) => !nextOpen && onClose()}
    >
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[78vh]">
        <DrawerHeader className="border-b px-4 pb-6">
          <div className="flex w-full items-center justify-center">
            <Logo variant="sidebar" width={140} height={46} />
          </div>
          <DrawerTitle className="sr-only">Menu de navigation</DrawerTitle>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4 pb-6">
          <nav className="space-y-6 pt-4">
            {navConfig.map((group) => (
              <section key={group.label} className="space-y-1">
                <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <DrawerClose asChild key={item.url}>
                    <Link
                      href={item.url}
                      onClick={onClose}
                      className={cn(
                        "flex items-center cursor-pointer gap-3 rounded-(--radius) px-3 py-3 text-sm",
                        pathname === item.url
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
            ))}
            <section className="space-y-1 border-t pt-4">
              <DrawerClose asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center cursor-pointer gap-3 rounded-(--radius) px-3 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
  );
}

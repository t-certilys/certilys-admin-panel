"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { dashboardNavConfig, type DashboardNavGroup } from "../../lib/dashboard-nav-config";

interface BottomNavProps {
  onMoreClick?: () => void;
  navConfig?: DashboardNavGroup[];
}

export function BottomNav({ onMoreClick, navConfig = dashboardNavConfig }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = navConfig.flatMap((group) => group.items).slice(0, 4);

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background lg:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const isActive = pathname === item.url;

          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex flex-col cursor-pointer items-center gap-1 px-2 py-2",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <HugeiconsIcon icon={item.icon} size={22} strokeWidth={1.5} />
              <span className="text-[10px] truncate w-full text-center">
                {item.shortTitle || item.title}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMoreClick}
          className="flex flex-col cursor-pointer items-center gap-1 px-2 py-2 text-muted-foreground"
        >
          <HugeiconsIcon icon={Menu01Icon} size={22} strokeWidth={1.5} />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </nav>
  );
}

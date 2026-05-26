"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { settingsNavMain, backToDashboard } from "../../../lib/settings-nav-config";

interface SettingsBottomNavProps {
  onMoreClick?: () => void;
}

export function SettingsBottomNav({ onMoreClick }: SettingsBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background md:hidden">
      <div className="grid grid-cols-5">
        <Link
          href={backToDashboard.url}
          className="flex flex-col cursor-pointer items-center gap-1 px-2 py-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <HugeiconsIcon icon={backToDashboard.icon} size={22} strokeWidth={1.5} />
          <span className="text-[10px]">Dashboard</span>
        </Link>

        {settingsNavMain.slice(0, 3).map((item) => {
          const isActive = pathname === item.url;

          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex flex-col cursor-pointer items-center gap-1 px-2 py-2 transition-colors",
                isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary",
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
          className="flex flex-col cursor-pointer items-center gap-1 px-2 py-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <HugeiconsIcon icon={Menu01Icon} size={22} strokeWidth={1.5} />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </nav>
  );
}

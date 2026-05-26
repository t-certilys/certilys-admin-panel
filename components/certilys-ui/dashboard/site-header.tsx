"use client";

import Link from "next/link";
import { Search01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { HeaderNotifications } from "./header-notifications";
import { ThemeToggle } from "../../layout/theme-toggle";

import { useCommandPalette } from "@/components/providers/command-provider";
import { Kbd } from "@/components/ui/kbd";

export function SiteHeader() {
  const { toggleSearch } = useCommandPalette();

  return (
    <header className="contents">
      <div className="flex w-full items-center gap-3 px-3 pt-3 sm:px-4 md:pt-4 lg:px-6">
        <button
          type="button"
          onClick={toggleSearch}
          className="group relative flex h-12 min-w-0 flex-1 cursor-pointer items-center rounded-full border border-input bg-card/55 px-4 text-sm text-muted-foreground shadow-sm backdrop-blur-xl transition-colors hover:bg-card/70 supports-backdrop-filter:bg-card/45 sm:max-w-sm lg:max-w-md"
          aria-label="Search everything (Ctrl+K)"
        >
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={1.5}
            className="mr-2 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          />
          <span className="flex-1 truncate text-left">Search docs...</span>
          <Kbd className="ml-2 hidden pointer-events-none opacity-60 sm:inline-flex">
            <span className="text-[10px]">Ctrl</span>K
          </Kbd>
        </button>

        <div className="ml-auto flex h-12 shrink-0 items-center gap-1 rounded-full border border-border/70 bg-card/55 p-1 shadow-sm backdrop-blur-xl supports-backdrop-filter:bg-card/45">
          <HeaderNotifications />
          <Link
            href="/settings"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full text-foreground/85 transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:outline-none"
            aria-label="Open settings"
            title="Settings"
          >
            <HugeiconsIcon icon={Settings01Icon} size={20} strokeWidth={1.5} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

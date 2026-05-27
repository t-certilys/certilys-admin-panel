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
    <header className="md:hidden block">
      <div className="flex w-full items-center gap-3 px-3 pt-3 sm:px-4">
        <button
          type="button"
          onClick={toggleSearch}
          className="group relative flex h-12 min-w-0 flex-1 cursor-pointer items-center rounded-full border border-input bg-card/55 px-4 text-sm text-muted-foreground shadow-sm backdrop-blur-xl transition-colors hover:bg-card/70 supports-backdrop-filter:bg-card/45"
          aria-label="Rechercher... (Ctrl+K)"
        >
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={1.5}
            className="mr-2 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          />
          <span className="flex-1 truncate text-left">Rechercher...</span>
        </button>
      </div>
    </header>
  );
}

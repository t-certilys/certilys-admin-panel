"use client";

import * as React from "react";
import {
  Search01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCommandPalette } from "@/components/providers/command-provider";
import { cn } from "@/lib/utils";
import { recentSearches, allResults } from "@/lib/search-data";

export function SearchDialog() {
  const { isSearchOpen, setIsSearchOpen } = useCommandPalette();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredResults = query.trim()
    ? allResults
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              item.label.toLowerCase().includes(query.toLowerCase()) ||
              item.description.toLowerCase().includes(query.toLowerCase()),
          ),
        }))
        .filter((group) => group.items.length > 0)
    : [];

  const allItems = filteredResults.flatMap((g) => g.items);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      window.location.href = allItems[activeIndex].href;
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  React.useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setActiveIndex(-1);
    }
  }, [isSearchOpen]);

  return (
    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogContent className="flex flex-col gap-0 p-0 max-h-[min(640px,85vh)] w-[min(720px,calc(100vw-2rem))]! max-w-[min(720px,calc(100vw-2rem))]! overflow-hidden border-border/40">
        <DialogTitle className="sr-only">Recherche globale</DialogTitle>
        <DialogDescription className="sr-only">
          Rechercher dans toute l'application
        </DialogDescription>

        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 shrink-0">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            strokeWidth={1.5}
            className="text-muted-foreground shrink-0"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher dans l'application..."
            className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Effacer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-2">
            {!query.trim() && (
              <div>
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recherches récentes
                </p>
                <div className="grid gap-0.5">
                  {recentSearches.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(item.label)}
                      className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors group"
                    >
                      <HugeiconsIcon
                        icon={Clock01Icon}
                        size={16}
                        strokeWidth={1.5}
                        className="text-muted-foreground shrink-0"
                      />
                      <span className="flex-1 min-w-0 truncate">
                        {item.label}
                      </span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={14}
                        strokeWidth={1.5}
                        className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.trim() && filteredResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={40}
                  strokeWidth={1}
                  className="text-muted-foreground/30 mb-3"
                />
                <p className="text-sm font-medium">
                  Aucun résultat pour « {query} »
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Essayez un autre terme de recherche.
                </p>
              </div>
            )}

            {filteredResults.map((group) => (
              <div key={group.category} className="mb-2 last:mb-0">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {group.category}
                </p>
                <div className="grid gap-0.5">
                  {group.items.map((item) => {
                    const idx = allItems.indexOf(item);
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm text-left transition-colors group",
                          activeIndex === idx
                            ? "bg-muted text-foreground"
                            : "hover:bg-muted/50",
                        )}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
                          <HugeiconsIcon
                            icon={item.icon}
                            size={16}
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium leading-none truncate">
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={14}
                          strokeWidth={1.5}
                          className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border/50 shrink-0">
          {[
            { keys: "↑↓", label: "naviguer" },
            { keys: "↵", label: "ouvrir" },
            { keys: "Esc", label: "fermer" },
          ].map(({ keys, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <kbd className="pointer-events-none inline-flex h-4 items-center rounded bg-muted border border-border/40 px-1 font-mono text-[9px] font-medium uppercase tracking-tighter">
                {keys}
              </kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

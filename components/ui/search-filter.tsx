"use client";

import * as React from "react";
import { ListFilterPlusIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterField {
  /** Identifiant unique du filtre */
  id: string;
  /** Label affiché dans le panel */
  label: string;
  /** Composant React à rendre comme champ de filtre */
  render: (value: string, onChange: (v: string) => void) => React.ReactNode;
}

export interface SearchFilterProps {
  /** Valeur courante du champ de recherche */
  searchValue?: string;
  /** Callback déclenché à chaque frappe dans la recherche */
  onSearchChange?: (value: string) => void;
  /** Placeholder du champ de recherche */
  placeholder?: string;
  /** Définition des champs de filtre dans le Sheet */
  filters?: FilterField[];
  /** Valeurs courantes des filtres — map { fieldId → value } */
  filterValues?: Record<string, string>;
  /** Callback déclenché lorsqu'on applique les filtres */
  onFiltersApply?: (values: Record<string, string>) => void;
  /** Callback déclenché lorsqu'on réinitialise les filtres */
  onFiltersReset?: () => void;
  /** Titre affiché dans l'en-tête du Sheet */
  sheetTitle?: string;
  /** Classes supplémentaires sur le conteneur principal */
  className?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function SearchFilter({
  searchValue = "",
  onSearchChange,
  placeholder = "Search...",
  filters = [],
  filterValues = {},
  onFiltersApply,
  onFiltersReset,
  sheetTitle = "Filters",
  className,
}: SearchFilterProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  // État local des filtres dans le Sheet (pas encore appliqués)
  const [draft, setDraft] =
    React.useState<Record<string, string>>(filterValues);

  // Sync le draft depuis l'extérieur quand le sheet s'ouvre
  React.useEffect(() => {
    if (sheetOpen) setDraft(filterValues);
  }, [sheetOpen, filterValues]);

  // Nombre de filtres actifs (non vides)
  const activeFilterCount = Object.values(filterValues).filter(Boolean).length;

  function handleApply() {
    onFiltersApply?.(draft);
    setSheetOpen(false);
  }

  function handleReset() {
    const empty = filters.reduce<Record<string, string>>((acc, f) => {
      acc[f.id] = "";
      return acc;
    }, {});
    setDraft(empty);
    onFiltersReset?.();
  }

  return (
    <>
      {/* ── Groupe input + bouton entonnoir ── */}
      <div
        data-slot="search-filter"
        className={cn(
          "flex h-8 items-center overflow-hidden rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring",
          className,
        )}
      >
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />

        {/* Séparateur vertical */}
        <div className="h-4 w-px shrink-0 bg-border" />

        {/* Bouton entonnoir */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Open filters"
          className={cn(
            "relative flex h-full cursor-pointer items-center justify-center px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            activeFilterCount > 0 && "text-primary",
          )}
        >
          <HugeiconsIcon
            icon={ListFilterPlusIcon}
            size={16}
            strokeWidth={1.5}
          />
          {/* Pastille indicateur de filtres actifs */}
          {activeFilterCount > 0 && (
            <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Sheet de filtres ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            <SheetDescription className="sr-only">
              Filter results by selecting specific criteria.
            </SheetDescription>
          </SheetHeader>

          <Separator />

          {/* Champs de filtres */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-2">
            {filters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No filters configured.
              </p>
            ) : (
              filters.map((field) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <Label htmlFor={`sf-filter-${field.id}`}>{field.label}</Label>
                  {field.render(draft[field.id] ?? "", (v) =>
                    setDraft((prev) => ({ ...prev, [field.id]: v })),
                  )}
                </div>
              ))
            )}
          </div>

          <Separator />

          {/* Footer */}
          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleReset}
            >
              Reset
            </Button>
            <SheetClose asChild>
              <Button type="button" className="flex-1" onClick={handleApply}>
                Apply
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

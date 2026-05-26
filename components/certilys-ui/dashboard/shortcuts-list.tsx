"use client";

import * as React from "react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Search01Icon,
  Sun01Icon,
  Moon01Icon,
  KeyboardIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const shortcuts = [
  {
    title: "Recherche Globale",
    description: "Ouvrir la modal de recherche depuis n'importe où",
    icon: Search01Icon,
    keys: ["Ctrl", "K"],
  },
  {
    title: "Mode Clair",
    description: "Basculer l'interface en mode clair",
    icon: Sun01Icon,
    keys: ["Ctrl", "Shift", "L"],
  },
  {
    title: "Mode Sombre",
    description: "Basculer l'interface en mode sombre",
    icon: Moon01Icon,
    keys: ["Ctrl", "Shift", "D"],
  },
  {
    title: "Voir les Raccourcis",
    description: "Maintenir enfoncé pour afficher cette modal",
    icon: KeyboardIcon,
    keys: ["Ctrl", "Alt", "O"],
  },
];

export function ShortcutsList() {
  return (
    <div className="grid gap-2 w-full overflow-hidden">
      {shortcuts.map((shortcut, index) => (
        <div
          key={index}
          className="w-full overflow-hidden rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5"
        >
          <div className="flex items-center gap-3 w-full min-w-0 overflow-hidden">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
              <HugeiconsIcon icon={shortcut.icon} size={16} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-medium leading-none truncate">
                {shortcut.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {shortcut.description}
              </p>
            </div>
          </div>

          <div className="mt-2 pl-11 overflow-hidden">
            <KbdGroup className="flex flex-wrap gap-1">
              {shortcut.keys.map((key, i) => (
                <React.Fragment key={i}>
                  <Kbd>{key}</Kbd>
                  {i < shortcut.keys.length - 1 && (
                    <span className="text-xs text-muted-foreground self-center">
                      +
                    </span>
                  )}
                </React.Fragment>
              ))}
            </KbdGroup>
          </div>
        </div>
      ))}
    </div>
  );
}

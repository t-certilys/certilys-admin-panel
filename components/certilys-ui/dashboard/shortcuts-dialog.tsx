"use client";

import { KeyboardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppDialog } from "@/components/certilys-ui/dialogs";
import { useCommandPalette } from "@/components/providers/command-provider";
import { ShortcutsList } from "./shortcuts-list";

export function ShortcutsDialog() {
  const { isShortcutsOpen, setIsShortcutsOpen } = useCommandPalette();

  return (
    <AppDialog
      open={isShortcutsOpen}
      onOpenChange={setIsShortcutsOpen}
      size="sm"
      title={
        <span className="flex items-center gap-2">
          <HugeiconsIcon
            icon={KeyboardIcon}
            size={18}
            strokeWidth={1.5}
            className="text-primary"
          />
          Raccourcis Clavier
        </span>
      }
      description="Liste de tous les raccourcis disponibles dans l'application."
    >
      <ShortcutsList />
    </AppDialog>
  );
}

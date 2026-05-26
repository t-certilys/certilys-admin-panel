"use client";

import { KeyboardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCommandPalette } from "@/components/providers/command-provider";
import { ShortcutsList } from "./shortcuts-list";

export function ShortcutsDialog() {
  const { isShortcutsOpen, setIsShortcutsOpen } = useCommandPalette();

  return (
    <Dialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={KeyboardIcon}
              size={18}
              strokeWidth={1.5}
              className="text-primary"
            />
            Raccourcis Clavier
          </DialogTitle>
          <DialogDescription>
            Liste de tous les raccourcis disponibles dans l'application.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="py-4">
          <ShortcutsList />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

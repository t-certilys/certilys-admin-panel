"use client";

import * as React from "react";
import { useTheme } from "next-themes";

interface CommandPaletteContextType {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isQuickCreateOpen: boolean;
  setIsQuickCreateOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  toggleSearch: () => void;
  toggleQuickCreate: () => void;
}

const CommandPaletteContext = React.createContext<
  CommandPaletteContextType | undefined
>(undefined);

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = React.useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false);
  const { setTheme } = useTheme();

  const toggleSearch = React.useCallback(
    () => setIsSearchOpen((prev) => !prev),
    [],
  );
  const toggleQuickCreate = React.useCallback(
    () => setIsQuickCreateOpen((prev) => !prev),
    [],
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Search Shortcut (Ctrl+K)
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSearch();
      }

      // Theme Shortcuts (Ctrl+Shift+L for Light, Ctrl+Shift+D for Dark)
      if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
        if (e.key === "l" || e.key === "L") {
          e.preventDefault();
          setTheme("light");
        } else if (e.key === "d" || e.key === "D") {
          e.preventDefault();
          setTheme("dark");
        }
      }

      // Shortcuts Modal (Hold Ctrl+Alt+O)
      if (
        (e.key === "o" || e.key === "O") &&
        e.altKey &&
        (e.ctrlKey || e.metaKey)
      ) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    const up = (e: KeyboardEvent) => {
      // Close shortcuts modal if Ctrl or Alt is released
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsShortcutsOpen(false);
      } else if (!e.ctrlKey && !e.metaKey) {
        setIsShortcutsOpen(false);
      } else if (!e.altKey) {
        setIsShortcutsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("keyup", up);
    };
  }, [toggleSearch, setTheme]);

  return (
    <CommandPaletteContext.Provider
      value={{
        isSearchOpen,
        setIsSearchOpen,
        isQuickCreateOpen,
        setIsQuickCreateOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        toggleSearch,
        toggleQuickCreate,
      }}
    >
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider",
    );
  }
  return context;
}

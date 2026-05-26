"use client";

import * as React from "react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const currentTheme = (resolvedTheme as "light" | "dark") || "light";
  const isDark = currentTheme === "dark";

  const toggleTheme = React.useCallback(() => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [currentTheme, setTheme]);

  if (!mounted) {
    return (
      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-full text-foreground/85 transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:outline-none"
        onClick={toggleTheme}
        aria-label="Switch theme"
        title="Switch theme"
        suppressHydrationWarning
      >
        <HugeiconsIcon icon={Moon02Icon} size={20} strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex size-10 items-center justify-center rounded-full text-foreground/85 transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:outline-none"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <HugeiconsIcon
        icon={isDark ? Sun03Icon : Moon02Icon}
        size={20}
        strokeWidth={1.5}
      />
    </button>
  );
}

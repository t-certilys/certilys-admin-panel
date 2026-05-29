"use client";

import * as React from "react";

// Le back-office Certilys est en mode light-only.
// next-themes est désactivé pour éviter l'injection de script au runtime (warning hydration).
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "../../layout/theme-toggle";
import { NavUser } from "../../layout/nav-user";
import { HeaderNotifications } from "../dashboard/header-notifications";
import { settingsNavMain } from "../../../lib/settings-nav-config";

type SettingsHeaderUser = {
  displayName?: string | null;
  email: string;
  avatarUrl?: string | null;
};

export function SettingsHeader({ user }: { user?: SettingsHeaderUser }) {
  const pathname = usePathname();
  
  // Trouver le titre de la section actuelle
  const currentSection = settingsNavMain.find(item => item.url === pathname);
  const title = currentSection?.title || "Settings";
  const headerUser = {
    name: user?.displayName?.trim() || user?.email.split("@")[0] || "Admin",
    email: user?.email ?? "admin@certilys.com",
    avatar: user?.avatarUrl ?? null,
  };

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-3 sm:px-4 lg:px-6">
        <h1 className="text-base font-medium text-foreground">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <HeaderNotifications />
          <ThemeToggle />
          <NavUser user={headerUser} compact />
        </div>
      </div>
    </header>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "../../layout/theme-toggle";
import { NavUser } from "../../layout/nav-user";
import { HeaderNotifications } from "../dashboard/header-notifications";
import { settingsNavMain } from "../../../lib/settings-nav-config";

const headerUser = {
  name: "murgo",
  email: "m@example.com",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=murgo",
};

export function SettingsHeader() {
  const pathname = usePathname();
  
  // Trouver le titre de la section actuelle
  const currentSection = settingsNavMain.find(item => item.url === pathname);
  const title = currentSection?.title || "Settings";

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

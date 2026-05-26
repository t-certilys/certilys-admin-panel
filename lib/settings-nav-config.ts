import {
  Configuration01Icon,
  DashboardSquare01Icon,
  Shield01Icon,
  UserAccountIcon,
  SecurityLockIcon,
} from "@hugeicons/core-free-icons";
import type { DashboardNavGroup } from "./dashboard-nav-config";

export const settingsBrand = {
  title: "Paramètres",
  url: "/settings",
};

export const settingsNavConfig: DashboardNavGroup[] = [
  {
    label: "Paramètres",
    items: [
      {
        title: "Gestion de profil",
        shortTitle: "Profil",
        url: "/settings/profile",
        icon: UserAccountIcon,
      },
      {
        title: "Gestion des paramètres",
        shortTitle: "Réglages",
        url: "/settings/account",
        icon: Configuration01Icon,
      },
      {
        title: "Sécurité",
        shortTitle: "Sécurité",
        url: "/settings/security",
        icon: Shield01Icon,
      },
      {
        title: "Vie privée",
        shortTitle: "Confidentialité",
        url: "/settings/privacy",
        icon: SecurityLockIcon,
      },
    ],
  },
  {
    label: "Navigation",
    items: [
      {
        title: "Retour au dashboard",
        shortTitle: "Dashboard",
        url: "/dashboard",
        icon: DashboardSquare01Icon,
      },
    ],
  },
];

export const settingsNavMain = settingsNavConfig[0].items;
export const backToDashboard = settingsNavConfig[1].items[0];

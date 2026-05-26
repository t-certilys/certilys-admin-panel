import {
  ApiIcon,
  CookBookIcon,
  DashboardSquare01Icon,
  HelpCircleIcon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface DashboardNavItem {
  title: string;
  shortTitle?: string;
  url: string;
  icon: IconSvgElement;
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

export const dashboardBrand = {
  title: "Certilys Dash.",
  url: "/dashboard",
};

export const dashboardNavConfig: DashboardNavGroup[] = [
  {
    label: "Home",
    items: [
      {
        title: "Tableau de bord",
        shortTitle: "Accueil",
        url: "/dashboard",
        icon: DashboardSquare01Icon,
      },
      {
        title: "Base des recettes",
        shortTitle: "Recettes",
        url: "/dashboard/recipes-db",
        icon: CookBookIcon,
      },
      {
        title: "Equipes",
        shortTitle: "Equipes",
        url: "/dashboard/team",
        icon: UserGroupIcon,
      },
    ],
  },

  {
    label: "Support",
    items: [
      {
        title: "Parametres",
        shortTitle: "Paramètres",
        url: "/settings",
        icon: Settings01Icon,
      },
      {
        title: "Aide",
        shortTitle: "Aide",
        url: "/dashboard/help",
        icon: HelpCircleIcon,
      },
      {
        title: "API",
        shortTitle: "API",
        url: "/dashboard/api",
        icon: ApiIcon,
      },
    ],
  },
];

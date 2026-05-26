import {
  Home01Icon,
  UserMultiple02Icon,
  Settings01Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export type SearchItem = {
  label: string;
  description: string;
  icon: IconSvgElement;
  href: string;
  keywords?: string[];
};

export type SearchGroup = {
  category: string;
  items: SearchItem[];
};

export const recentSearches = [
  { label: "Tableau de bord", icon: Home01Icon },
  { label: "Gestion des utilisateurs", icon: UserMultiple02Icon },
  { label: "Paramètres système", icon: Settings01Icon },
];

export const allResults: SearchGroup[] = [
  {
    category: "Pages",
    items: [
      {
        label: "Tableau de bord",
        description: "Vue d'ensemble de l'application",
        icon: Home01Icon,
        href: "/dashboard",
      },
      {
        label: "Utilisateurs",
        description: "Gérer les comptes utilisateurs",
        icon: UserMultiple02Icon,
        href: "/dashboard/users",
      },
      {
        label: "Paramètres",
        description: "Configuration du système",
        icon: Settings01Icon,
        href: "/dashboard/settings",
      },
    ],
  },
  {
    category: "Documents",
    items: [
      {
        label: "Documentation API",
        description: "Référence complète de l'API",
        icon: File01Icon,
        href: "/api/docs",
      },
      {
        label: "Guide d'administration",
        description: "Manuel de l'administrateur",
        icon: File01Icon,
        href: "/docs/admin",
      },
    ],
  },
];

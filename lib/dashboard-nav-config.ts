import {
  DashboardSquare01Icon,
  Book01Icon,
  UserGroupIcon,
  UserMultiple02Icon,
  Settings01Icon,
  HelpCircleIcon,
  Notification01Icon,
  Shield01Icon,
  InvoiceIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface DashboardNavItem {
  title: string;
  shortTitle?: string;
  url: string;
  icon: IconSvgElement;
  badge?: string | number;
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

export const dashboardBrand = {
  title: "Certilys Admin",
  url: "/dashboard",
};

export const dashboardNavConfig: DashboardNavGroup[] = [
  {
    label: "Certilys",
    items: [
      {
        title: "Tableau de bord",
        shortTitle: "Accueil",
        url: "/dashboard",
        icon: DashboardSquare01Icon,
      },
      {
        title: "Formations",
        shortTitle: "Formations",
        url: "/dashboard/courses",
        icon: Book01Icon,
      },
      {
        title: "Formateurs",
        shortTitle: "Formateurs",
        url: "/dashboard/instructors",
        icon: UserGroupIcon,
      },
      {
        title: "Utilisateurs",
        shortTitle: "Utilisateurs",
        url: "/dashboard/users",
        icon: UserMultiple02Icon,
      },
      {
        title: "Commandes / Paiements",
        shortTitle: "Commandes",
        url: "/dashboard/orders",
        icon: InvoiceIcon,
      },
    ],
  },
  {
    label: "Système & Support",
    items: [
      {
        title: "Notifications",
        shortTitle: "Notifs",
        url: "/dashboard/notifications",
        icon: Notification01Icon,
        badge: 3, // Badge dynamique mocké de notifications non-lues
      },
      {
        title: "Logs / Audit",
        shortTitle: "Audits",
        url: "/dashboard/logs",
        icon: Shield01Icon,
      },
      {
        title: "Paramètres",
        shortTitle: "Réglages",
        url: "/settings",
        icon: Settings01Icon,
      },
      {
        title: "Aide",
        shortTitle: "Aide",
        url: "/dashboard/help",
        icon: HelpCircleIcon,
      },
    ],
  },
];

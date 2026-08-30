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
  UserStar01Icon,
  Wallet01Icon,
  Configuration01Icon,
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
        title: "Formateurs",
        shortTitle: "Formateurs",
        url: "/dashboard/instructors",
        icon: UserGroupIcon,
      },
      {
        title: "Formations",
        shortTitle: "Formations",
        url: "/dashboard/courses",
        icon: Book01Icon,
      },
      {
        title: "Commandes / Paiements",
        shortTitle: "Commandes",
        url: "/dashboard/orders",
        icon: InvoiceIcon,
      },
      {
        title: "Reversements",
        shortTitle: "Reversements",
        url: "/dashboard/payouts",
        icon: Wallet01Icon,
      },
      {
        title: "Utilisateurs",
        shortTitle: "Utilisateurs",
        url: "/dashboard/users",
        icon: UserMultiple02Icon,
      },
      {
        title: "Équipe interne",
        shortTitle: "Équipe",
        url: "/dashboard/team",
        icon: UserStar01Icon,
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
      },
      {
        title: "Logs / Audit",
        shortTitle: "Audits",
        url: "/dashboard/audit-logs",
        icon: Shield01Icon,
      },
      {
        title: "Configurations du site",
        shortTitle: "Site",
        url: "/dashboard/site-configuration",
        icon: Configuration01Icon,
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

export function withNotificationUnreadCount(unreadCount: number) {
  return dashboardNavConfig.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.url === "/dashboard/notifications"
        ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined }
        : item,
    ),
  }));
}

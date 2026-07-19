"use server";

import { adminDelete, adminGet, adminPatch } from "@/lib/admin-api";

export type AdminNotificationItem = {
  id: string;
  title: string;
  description: string;
  category: "formation" | "paiement" | "systeme" | "utilisateur";
  severity: "info" | "warning" | "critical";
  createdAt: string;
  isRead: boolean;
};

type AdminNotificationsApiResponse = {
  notifications: AdminNotificationItem[];
  kpis: {
    unread: number;
    critical: number;
    payments: number;
    validations: number;
  };
};

type NotificationMutationResponse = {
  success: boolean;
  updatedCount?: number;
};

export async function getAdminNotificationsAction() {
  const response = await adminGet<AdminNotificationsApiResponse>(
    "/admin/notifications",
  );
  return {
    ...response,
    notifications: response.notifications.map((notification) => ({
      ...notification,
      createdAt: formatNotificationDate(notification.createdAt),
    })),
  };
}

export async function markAdminNotificationAsReadAction(id: string) {
  return adminPatch<NotificationMutationResponse>(
    `/admin/notifications/${encodeURIComponent(id)}/read`,
  );
}

export async function markAllAdminNotificationsAsReadAction() {
  return adminPatch<NotificationMutationResponse>(
    "/admin/notifications/read-all",
  );
}

export async function deleteAdminNotificationAction(id: string) {
  return adminDelete<NotificationMutationResponse>(
    `/admin/notifications/${encodeURIComponent(id)}`,
  );
}

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const datePart = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos",
  }).format(date);
  return `${datePart}, ${timePart}`;
}

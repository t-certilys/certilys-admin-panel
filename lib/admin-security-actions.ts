"use server";

import { AdminApiError, adminGet, adminMutation } from "@/lib/admin-api";

export type AdminSecuritySession = {
  id: string;
  deviceLabel: string;
  ipAddress?: string | null;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent: boolean;
  twoFactorVerifiedAt?: string | null;
  sessionCount: number;
};

export type AdminSecurityOverview = {
  authProvider: string;
  passwordEnabled: boolean;
  twoFactorEnabled: boolean;
  twoFactorConfirmedAt?: string | null;
  twoFactorVerified: boolean;
  currentSessionId: string;
  totalSessionsCount: number;
  visibleSessionsCount: number;
  sessions: AdminSecuritySession[];
};

export async function getAdminSecurityOverviewAction() {
  try {
    return await adminGet<AdminSecurityOverview>("/admin/auth/security");
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function revokeOtherAdminSessionsAction() {
  try {
    await adminMutation<{ status: string }>("/admin/auth/sessions/revoke-others");
    return {
      success: true,
      message: "Les autres sessions ont été déconnectées.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de déconnecter les autres sessions.",
    };
  }
}

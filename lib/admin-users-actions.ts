"use server";

import { AdminApiError, adminGet, adminMutation } from "@/lib/admin-api";
import type { AdminUser, AccountStatus, UserRole } from "@/lib/mock/admin-users-data";

export type AdminUsersKpis = {
  total: number;
  active: number;
  suspended: number;
  twoFactor: number;
};

type AdminUsersListResponse = {
  users: AdminUser[];
  kpis: AdminUsersKpis;
};

type AdminUserResponse = {
  user: AdminUser;
};

type AdminUsersQuery = {
  q?: string;
  role?: UserRole | "";
  status?: AccountStatus | "";
};

export async function getAdminUsersAction(
  query: AdminUsersQuery = {},
): Promise<AdminUsersListResponse> {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.role) params.set("role", query.role);
  if (query.status) params.set("status", query.status);

  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  return adminGet<AdminUsersListResponse>(`/admin/users${suffix}`);
}

export async function getAdminUserAction(id: string): Promise<AdminUser | null> {
  try {
    const response = await adminGet<AdminUserResponse>(
      `/admin/users/${encodeURIComponent(id)}`,
    );
    return response.user;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function suspendAdminUserAction(
  id: string,
  reason: string,
): Promise<AdminUser> {
  const response = await adminMutation<AdminUserResponse>(
    `/admin/users/${encodeURIComponent(id)}/suspend`,
    { reason: reason.trim() },
  );
  return response.user;
}

export async function reactivateAdminUserAction(id: string): Promise<AdminUser> {
  const response = await adminMutation<AdminUserResponse>(
    `/admin/users/${encodeURIComponent(id)}/reactivate`,
  );
  return response.user;
}

export async function disableAdminUserTwoFactorAction(
  id: string,
  reason: string,
): Promise<AdminUser> {
  const response = await adminMutation<AdminUserResponse>(
    `/admin/users/${encodeURIComponent(id)}/disable-2fa`,
    { reason: reason.trim() },
  );
  return response.user;
}

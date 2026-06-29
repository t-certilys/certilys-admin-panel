"use server";

import { adminGet } from "@/lib/admin-api";

export type AuditSeverity = "info" | "warning" | "critical";

export type AdminAuditLog = {
  id: string;
  action: string;
  adminId: string;
  adminName: string;
  adminEmail?: string;
  adminRole: "ADMIN" | "MODERATOR" | string;
  targetType: "INSTRUCTOR" | "COURSE" | "USER" | "ORDER" | "SYSTEM" | string;
  targetId: string;
  targetLabel: string;
  reason?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
  severity: AuditSeverity;
};

export type AuditKpis = {
  totalCount: number;
  todayCount: number;
  criticalCount: number;
  revocationsCount: number;
};

export type AdminAuditLogsResponse = {
  logs: AdminAuditLog[];
  kpis: AuditKpis;
  admins: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
};

export async function getAdminAuditLogsAction(): Promise<AdminAuditLogsResponse> {
  return adminGet<AdminAuditLogsResponse>("/admin/audit-logs?limit=300");
}

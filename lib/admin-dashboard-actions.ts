"use server";

import { adminGet } from "@/lib/admin-api";
import type {
  DashboardKpi,
  PriorityAction,
  RecentOrder,
  RevenuePoint,
  ValidationPoint,
} from "@/lib/mock/admin-dashboard-data";

export type AdminDashboardData = {
  kpis: DashboardKpi[];
  revenue: RevenuePoint[];
  validation: ValidationPoint[];
  priorityActions: PriorityAction[];
  recentOrders: RecentOrder[];
};

export async function getAdminDashboardAction(): Promise<AdminDashboardData> {
  return adminGet<AdminDashboardData>("/admin/dashboard");
}

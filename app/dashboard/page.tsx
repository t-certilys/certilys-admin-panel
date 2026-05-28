import { AdminDashboardHeader } from "@/components/certilys-ui/dashboard/admin-dashboard-header";
import { KpiCards } from "@/components/certilys-ui/dashboard/kpi-cards";
import { RevenueChart } from "@/components/certilys-ui/dashboard/revenue-chart";
import { ValidationChart } from "@/components/certilys-ui/dashboard/validation-chart";
import { PriorityActions } from "@/components/certilys-ui/dashboard/priority-actions";
import { RecentOrders } from "@/components/certilys-ui/dashboard/recent-orders";

import { kpiData, priorityActions } from "@/lib/mock/admin-dashboard-data";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 py-4 lg:gap-8 lg:py-6 @container/main">
      {/* ── 1. Header ─────────────────────────────────────────────────── */}
      <AdminDashboardHeader />

      {/* ── 2. KPI Cards ──────────────────────────────────────────────── */}
      <KpiCards kpis={kpiData} />

      {/* ── 3. Revenue Chart (pleine largeur) ─────────────────────────── */}
      <div className="px-4 lg:px-6">
        <RevenueChart />
      </div>

      {/* ── 4. Validation Chart + Actions prioritaires (2 colonnes desktop) */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-5 lg:px-6">
        {/* Chart validation — 3/5 sur desktop */}
        <div className="lg:col-span-3">
          <ValidationChart />
        </div>
        {/* Actions prioritaires — 2/5 sur desktop */}
        <div className="lg:col-span-2">
          <PriorityActions actions={priorityActions} />
        </div>
      </div>

      {/* ── 5. Dernières commandes ────────────────────────────────────── */}
      <div className="px-4 pb-4 lg:px-6 lg:pb-6">
        <RecentOrders />
      </div>
    </div>
  );
}

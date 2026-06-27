"use server";

import { adminGet } from "@/lib/admin-api";
import { getAdminCoursesAction } from "@/lib/admin-courses-actions";
import { getInstructorApplicationsAction } from "@/lib/admin-instructors-actions";
import type {
  DashboardKpi,
  PriorityAction,
  RecentOrder,
  RevenuePoint,
  ValidationPoint,
} from "@/lib/mock/admin-dashboard-data";

type AdminOrdersResponse = {
  orders: Array<{
    id: string;
    reference: string;
    status: string;
    totalAmount: number;
    currency: "XOF";
    paidAt: string | null;
    createdAt: string;
    customer?: {
      displayName?: string | null;
      email?: string | null;
    } | null;
    items: Array<{
      title: string;
      course?: { title?: string | null } | null;
    }>;
  }>;
};

export type AdminDashboardData = {
  kpis: DashboardKpi[];
  revenue: RevenuePoint[];
  validation: ValidationPoint[];
  priorityActions: PriorityAction[];
  recentOrders: RecentOrder[];
};

export async function getAdminDashboardAction(): Promise<AdminDashboardData> {
  const [courses, instructors, ordersResponse] = await Promise.all([
    getAdminCoursesAction().catch(() => []),
    getInstructorApplicationsAction().catch(() => []),
    adminGet<AdminOrdersResponse>("/admin/payments/orders?limit=50").catch(
      () => ({ orders: [] }),
    ),
  ]);

  const orders = ordersResponse.orders;
  const paidOrders = orders.filter((order) => order.status === "PAID");
  const revenue = buildRevenueSeries(paidOrders);
  const grossRevenue = paidOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const commission = Math.round(grossRevenue * 0.15);
  const pendingInstructors = instructors.filter(
    (application) => application.status === "PENDING",
  ).length;
  const submittedCourses = courses.filter(
    (course) => course.status === "SUBMITTED",
  ).length;
  const rejectedOrChanges = courses.filter((course) =>
    ["REJECTED", "CHANGES_REQUESTED"].includes(course.status),
  ).length;

  return {
    kpis: [
      moneyKpi("ca-brut", "CA brut du mois", grossRevenue, revenue, "CA payé"),
      moneyKpi(
        "commission",
        "Commission Certilys",
        commission,
        revenue.map((point) => ({
          ...point,
          caBrut: point.commission,
        })),
        "15% du CA brut",
      ),
      countKpi(
        "formateurs-attente",
        "Formateurs en attente",
        pendingInstructors,
        "Candidatures à vérifier",
      ),
      countKpi(
        "formations-valider",
        "Formations à valider",
        submittedCourses,
        "Soumissions en attente",
      ),
    ],
    revenue,
    validation: buildValidationSeries(courses, instructors),
    priorityActions: [
      {
        id: "formateurs-pending",
        label: "Formateurs en attente de validation",
        count: pendingInstructors,
        urgency: pendingInstructors > 0 ? "critical" : "info",
        href: "/dashboard/instructors?status=PENDING",
      },
      {
        id: "formations-submitted",
        label: "Formations soumises à révision",
        count: submittedCourses,
        urgency: submittedCourses > 0 ? "critical" : "info",
        href: "/dashboard/courses?status=SUBMITTED",
      },
      {
        id: "formations-corrections",
        label: "Corrections ou rejets de formations",
        count: rejectedOrChanges,
        urgency: rejectedOrChanges > 0 ? "warning" : "info",
        href: "/dashboard/courses",
      },
    ],
    recentOrders: orders.slice(0, 5).map(mapRecentOrder),
  };
}

function moneyKpi(
  id: string,
  label: string,
  value: number,
  series: RevenuePoint[],
  context: string,
): DashboardKpi {
  return {
    id,
    label,
    value,
    displayValue: formatXof(value),
    currency: "XOF",
    trend: value > 0 ? "+ réel" : "0",
    trendDirection: value > 0 ? "up" : "neutral",
    trendLabel: "Calculé depuis les commandes réelles",
    context,
    sparkline: series.slice(-10).map((point) => ({ value: point.caBrut })),
  };
}

function countKpi(
  id: string,
  label: string,
  value: number,
  context: string,
): DashboardKpi {
  return {
    id,
    label,
    value,
    displayValue: String(value),
    trend: value > 0 ? `+ ${value}` : "0",
    trendDirection: value > 0 ? "down" : "neutral",
    trendLabel: "Action calculée depuis les données réelles",
    context,
    sparkline: Array.from({ length: 10 }, (_, index) => ({
      value: index === 9 ? value : Math.max(0, value - (9 - index)),
    })),
  };
}

function buildRevenueSeries(orders: AdminOrdersResponse["orders"]) {
  const days = lastDays(30);
  return days.map((date) => {
    const caBrut = orders
      .filter((order) => sameDate(order.paidAt ?? order.createdAt, date))
      .reduce((sum, order) => sum + order.totalAmount, 0);
    return {
      date: date.toISOString().slice(0, 10),
      caBrut,
      commission: Math.round(caBrut * 0.15),
    };
  });
}

function buildValidationSeries(
  courses: Awaited<ReturnType<typeof getAdminCoursesAction>>,
  instructors: Awaited<ReturnType<typeof getInstructorApplicationsAction>>,
) {
  const weeks = lastWeeks(6);
  return weeks.map((week, index) => {
    const weekCourses = courses.filter((course) =>
      isInWeek(course.submittedAt, week),
    );
    const weekInstructors = instructors.filter((application) =>
      isInWeek(application.submittedAt, week),
    );
    return {
      date: `S${index + 1}`,
      candidatures: weekInstructors.length,
      formateursApprouves: weekInstructors.filter(
        (application) => application.status === "APPROVED",
      ).length,
      formationsSoumises: weekCourses.length,
      formationsApprouvees: weekCourses.filter((course) =>
        ["APPROVED", "PUBLISHED"].includes(course.status),
      ).length,
    } satisfies ValidationPoint;
  });
}

function mapRecentOrder(order: AdminOrdersResponse["orders"][number]) {
  const item = order.items[0];
  return {
    id: order.reference || order.id,
    client:
      order.customer?.displayName ||
      order.customer?.email ||
      "Client Certilys",
    formation: item?.course?.title || item?.title || "Formation Certilys",
    montant: order.totalAmount,
    currency: order.currency,
    statut: mapOrderStatus(order.status),
    date: order.paidAt ?? order.createdAt,
  } satisfies RecentOrder;
}

function mapOrderStatus(status: string): RecentOrder["statut"] {
  if (status === "PAID") return "PAID";
  if (status === "FAILED" || status === "CANCELLED" || status === "EXPIRED") {
    return "FAILED";
  }
  if (status === "REFUNDED") return "REFUNDED";
  return "PENDING";
}

function lastDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (count - 1 - index));
    return date;
  });
}

function lastWeeks(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (count - 1 - index) * 7);
    return date;
  });
}

function sameDate(value: string, date: Date) {
  const current = new Date(value);
  return current.toISOString().slice(0, 10) === date.toISOString().slice(0, 10);
}

function isInWeek(value: string | null, weekStart: Date) {
  if (!value) return false;
  const current = new Date(value).getTime();
  const start = weekStart.getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return current >= start && current < end;
}

function formatXof(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} F CFA`;
}

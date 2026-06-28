"use server";

import { adminGet, adminMutation, AdminApiError } from "@/lib/admin-api";
import type {
  AdminOrder,
  OrderStatus,
  PaymentStatus,
  AccessStatus,
  BillingSnapshot,
} from "@/lib/mock/admin-orders-data";

// ─────────────────────────────────────────────────────────────────────────────
// Types backend
// ─────────────────────────────────────────────────────────────────────────────

type BackendAdminOrder = {
  id: string;
  reference: string;
  orderStatus: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  accessStatus: "ACTIVE" | "REVOKED" | "EXPIRED" | "NOT_CREATED";
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  amountXOF: number;
  discountXOF: number;
  totalXOF: number;
  commissionRate: number;
  commissionXOF: number;
  netInstructorXOF: number;
  currency: string;
  apprenant: {
    id: string;
    name: string;
    email: string;
    firstName: string;
    lastName: string;
    country: string;
    city: string;
    phone: string;
    avatarUrl: string | null;
  };
  formation: {
    id: string;
    title: string;
    slug: string;
    instructorName: string;
    priceXOF: number;
    status: string;
  };
  billingSnapshot: {
    name: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  paiement: {
    provider: string;
    sessionId: string;
    paymentId: string | null;
    paidAt: string | null;
    failedAt: string | null;
    refundedAt: string | null;
    rawPayload: Record<string, unknown>;
    failureReason: string | null;
  };
  access: {
    enrollmentId: string | null;
    progressPercent: number;
    createdAt: string | null;
    revokedAt: string | null;
    revocationReason: string | null;
  };
};

type OrdersListResponse = {
  orders: BackendAdminOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type OrderResponse = {
  order: BackendAdminOrder;
};

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminOrdersAction(
  status?: string,
  page = 1,
  limit = 50,
): Promise<AdminOrder[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await adminGet<OrdersListResponse>(
    `/admin/payments/orders${query}`,
  );
  return response.orders.map(mapOrder);
}

export async function getAdminOrderAction(
  id: string,
): Promise<AdminOrder | null> {
  try {
    const response = await adminGet<OrderResponse>(
      `/admin/payments/orders/${encodeURIComponent(id)}`,
    );
    return mapOrder(response.order);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper backend → AdminOrder (type du mock existant)
// ─────────────────────────────────────────────────────────────────────────────

function mapOrder(o: BackendAdminOrder): AdminOrder {
  return {
    id: o.id,
    orderStatus: mapOrderStatus(o.orderStatus),
    paymentStatus: o.paymentStatus as PaymentStatus,
    accessStatus: o.accessStatus as AccessStatus,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    amountXOF: o.amountXOF,
    discountXOF: o.discountXOF,
    totalXOF: o.totalXOF,
    commissionRate: o.commissionRate,
    commissionXOF: o.commissionXOF,
    netInstructorXOF: o.netInstructorXOF,
    apprenant: {
      name: o.apprenant.name,
      email: o.apprenant.email,
      phone: o.apprenant.phone || "",
      country: o.apprenant.country || "",
      city: o.apprenant.city || "",
    },
    formation: {
      id: o.formation.id,
      title: o.formation.title,
      instructorName: o.formation.instructorName,
      priceXOF: o.formation.priceXOF,
      status: o.formation.status,
    },
    billingSnapshot: mapBillingSnapshot(o.billingSnapshot),
    paiement: {
      provider: "MONEROO",
      sessionId: o.paiement.sessionId,
      paymentId: o.paiement.paymentId ?? undefined,
      paidAt: o.paiement.paidAt ?? undefined,
      failedAt: o.paiement.failedAt ?? undefined,
      refundedAt: o.paiement.refundedAt ?? undefined,
      rawPayload: {
        event: "",
        data: o.paiement.rawPayload,
      },
    },
    access: {
      enrollmentId: o.access.enrollmentId ?? undefined,
      progressPercent: o.access.progressPercent,
      createdAt: o.access.createdAt ?? undefined,
      revokedAt: o.access.revokedAt ?? undefined,
      revocationReason: o.access.revocationReason ?? undefined,
    },
    events: buildEvents(o),
  };
}

function mapOrderStatus(status: string): OrderStatus {
  if (status === "PAID") return "PAID";
  if (status === "CANCELLED" || status === "EXPIRED") return "CANCELLED";
  if (status === "REFUNDED") return "EXPIRED"; // Mapped to closest mock status
  return "INITIATED";
}

function mapBillingSnapshot(
  snapshot: BackendAdminOrder["billingSnapshot"],
): BillingSnapshot {
  return {
    name: snapshot.name,
    address: snapshot.address || "",
    city: snapshot.city || "",
    country: snapshot.country || "",
    postalCode: snapshot.postalCode,
  };
}

function buildEvents(
  o: BackendAdminOrder,
): Array<{ title: string; date: string; description: string }> {
  const events: Array<{ title: string; date: string; description: string }> = [];

  events.push({
    title: "Commande créée",
    date: o.createdAt,
    description: `Commande ${o.reference} créée par ${o.apprenant.name}.`,
  });

  if (o.paiement.paidAt) {
    events.push({
      title: "Paiement reçu",
      date: o.paiement.paidAt,
      description: `Paiement de ${o.totalXOF.toLocaleString("fr-FR")} F CFA confirmé via ${o.paiement.provider}.`,
    });
  }

  if (o.access.createdAt && o.accessStatus === "ACTIVE") {
    events.push({
      title: "Accès accordé",
      date: o.access.createdAt,
      description: "L'apprenant a obtenu l'accès à la formation.",
    });
  }

  if (o.access.revokedAt) {
    events.push({
      title: "Accès révoqué",
      date: o.access.revokedAt,
      description: `L'accès à la formation a été révoqué. Motif : ${o.access.revocationReason ?? "non précisé"}.`,
    });
  }

  if (o.paiement.failedAt) {
    events.push({
      title: "Paiement échoué",
      date: o.paiement.failedAt,
      description: `Le paiement a échoué. ${o.paiement.failureReason ? `Motif : ${o.paiement.failureReason}` : ""}`,
    });
  }

  if (o.refundedAt) {
    events.push({
      title: "Remboursement effectué",
      date: o.refundedAt,
      description: "La commande a été remboursée.",
    });
  }

  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

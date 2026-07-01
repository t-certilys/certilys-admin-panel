"use server";

import { adminGet, adminMutation } from "@/lib/admin-api";

export type AdminPayoutStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export type AdminPayoutDestination =
  | { type: "MOBILE_MONEY"; network: string; phone: string }
  | {
      type: "BANK_TRANSFER";
      holder: string;
      bankName: string;
      iban: string;
      bic: string;
    }
  | { type: "UNKNOWN"; label: string };

export type AdminPayout = {
  id: string;
  instructorName: string;
  instructorHandle: string;
  amount: number;
  currency: string;
  destination: AdminPayoutDestination;
  triggerType: "AUTOMATIC_MONTHLY" | "MANUAL_REQUEST" | "ADMIN_RETRY";
  requestedAt: string;
  status: AdminPayoutStatus;
  processedAt?: string | null;
  failureReason?: string | null;
};

type BackendPayout = {
  id: string;
  triggerType: AdminPayout["triggerType"];
  status: AdminPayoutStatus;
  totalAmount: number;
  currency: string;
  failureReason?: string | null;
  initiatedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  method?: {
    payoutMethodType?: string | null;
    accountLabel?: string | null;
    holderName?: string | null;
    country?: string | null;
    maskedAccountIdentifier?: string | null;
  } | null;
  instructor?: {
    displayName?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;
};

type BackendPayoutsResponse = {
  payouts: BackendPayout[];
};

type BackendPayoutResponse = {
  payout: BackendPayout;
};

export async function getAdminPayoutsAction(): Promise<AdminPayout[]> {
  const response = await adminGet<BackendPayoutsResponse>("/admin/payouts");
  return response.payouts.map(mapPayout);
}

export async function retryAdminPayoutAction(
  payoutId: string,
): Promise<AdminPayout> {
  const response = await adminMutation<BackendPayoutResponse>(
    `/admin/payouts/${encodeURIComponent(payoutId)}/retry`,
  );
  return mapPayout(response.payout);
}

function mapPayout(payout: BackendPayout): AdminPayout {
  const instructorName =
    payout.instructor?.displayName?.trim() ||
    payout.instructor?.username?.trim() ||
    payout.instructor?.email?.trim() ||
    "Formateur Certilys";

  return {
    id: payout.id,
    instructorName,
    instructorHandle: payout.instructor?.username?.trim() || "",
    amount: payout.totalAmount,
    currency: payout.currency || "XOF",
    destination: mapDestination(payout.method),
    triggerType: payout.triggerType,
    requestedAt: payout.initiatedAt ?? payout.createdAt,
    status: payout.status,
    processedAt: payout.completedAt,
    failureReason: payout.failureReason ?? null,
  };
}

function mapDestination(method: BackendPayout["method"]): AdminPayoutDestination {
  if (!method) {
    return { type: "UNKNOWN", label: "Méthode non renseignée" };
  }

  const label = payoutMethodLabel(method.payoutMethodType);
  if (method.payoutMethodType === "BANK_TRANSFER") {
    return {
      type: "BANK_TRANSFER",
      holder: method.holderName ?? method.accountLabel ?? "Titulaire non renseigné",
      bankName: method.accountLabel ?? "Banque non renseignée",
      iban: method.maskedAccountIdentifier ?? "Compte masqué",
      bic: "",
    };
  }

  return {
    type: "MOBILE_MONEY",
    network: label,
    phone: method.maskedAccountIdentifier ?? "Compte masqué",
  };
}

function payoutMethodLabel(value?: string | null) {
  switch (value) {
    case "MTN_MOMO":
      return "MTN Mobile Money";
    case "MOOV_MONEY":
      return "Moov Money";
    case "ORANGE_MONEY":
      return "Orange Money";
    case "WAVE":
      return "Wave";
    case "FREE_MONEY":
      return "Free Money";
    case "BANK_TRANSFER":
      return "Virement bancaire";
    default:
      return "Méthode non renseignée";
  }
}


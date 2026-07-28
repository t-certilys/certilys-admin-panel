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
  provider: string;
  providerPayoutId?: string | null;
  providerStatus?: string | null;
  runPeriod?: string | null;
  retryable: boolean;
  requiresReconciliation: boolean;
  lastSyncedAt?: string | null;
  reconciliationAttempts: number;
  statusReason?: string | null;
};

export type AdminPayoutRunStatus =
  | "PENDING"
  | "PROCESSING"
  | "PARTIAL"
  | "SUCCEEDED"
  | "FAILED";

export type AdminPayoutRun = {
  runId: string;
  period: string;
  status: AdminPayoutRunStatus;
  scanned: number;
  eligible: number;
  created: number;
  processing: number;
  succeeded: number;
  failed: number;
  skipped: number;
  totalSubmittedAmount: number;
  totalSucceededAmount: number;
  currency: string;
  startedAt?: string | null;
  heartbeatAt?: string | null;
  completedAt?: string | null;
};

export type AdminPayoutRunItem = {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorHandle: string;
  instructorEmail: string;
  payoutId?: string | null;
  providerPayoutId?: string | null;
  requiresReconciliation: boolean;
  amount: number;
  currency: string;
  status: "PENDING" | "SKIPPED" | "PROCESSING" | "SUCCEEDED" | "FAILED";
  reason?: string | null;
  error?: string | null;
  attempts: number;
};

export type PayoutFailureChallenge = {
  challengeId: string;
  confirmationPhrase: string;
  expiresAt: string;
};

type BackendPayout = {
  id: string;
  provider: string;
  triggerType: AdminPayout["triggerType"];
  status: AdminPayoutStatus;
  totalAmount: number;
  currency: string;
  providerPayoutId?: string | null;
  providerStatus?: string | null;
  runPeriod?: string | null;
  retryable?: boolean;
  requiresReconciliation?: boolean;
  lastSyncedAt?: string | null;
  reconciliationAttempts?: number;
  statusReason?: string | null;
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

type BackendPayoutsResponse = { payouts: BackendPayout[] };
type BackendPayoutResponse = { payout: BackendPayout };
type BackendRunsResponse = { runs: AdminPayoutRun[] };
type BackendRunResponse = {
  run: AdminPayoutRun & { items: AdminPayoutRunItem[] };
};

export async function getAdminPayoutsAction(): Promise<AdminPayout[]> {
  const response = await adminGet<BackendPayoutsResponse>("/admin/payouts");
  return response.payouts.map(mapPayout);
}

export async function retryAdminPayoutAction(payoutId: string) {
  return mutatePayout(`/admin/payouts/${encodeURIComponent(payoutId)}/retry`);
}

export async function syncAdminPayoutAction(payoutId: string) {
  return mutatePayout(`/admin/payouts/${encodeURIComponent(payoutId)}/sync`);
}

export async function attachProviderPayoutIdAction(
  payoutId: string,
  providerPayoutId: string,
) {
  return mutatePayout(
    `/admin/payouts/${encodeURIComponent(payoutId)}/reconciliation/resolve`,
    { action: "ATTACH_PROVIDER_ID", providerPayoutId },
  );
}

export async function createPayoutFailureChallengeAction(
  payoutId: string,
  reason: string,
) {
  return adminMutation<PayoutFailureChallenge>(
    `/admin/payouts/${encodeURIComponent(payoutId)}/reconciliation/failure-challenge`,
    { reason },
  );
}

export async function confirmPayoutFailureAction(
  payoutId: string,
  challengeId: string,
  confirmationPhrase: string,
) {
  return mutatePayout(
    `/admin/payouts/${encodeURIComponent(payoutId)}/reconciliation/resolve`,
    {
      action: "CONFIRM_DEFINITIVE_FAILURE",
      challengeId,
      confirmationPhrase,
    },
  );
}

export async function getAdminPayoutRunsAction() {
  const response = await adminGet<BackendRunsResponse>("/admin/payout-runs");
  return response.runs;
}

export async function getAdminPayoutRunAction(runId: string) {
  const response = await adminGet<BackendRunResponse>(
    `/admin/payout-runs/${encodeURIComponent(runId)}`,
  );
  return response.run;
}

async function mutatePayout(
  path: string,
  body?: Record<string, unknown>,
): Promise<AdminPayout> {
  const response = await adminMutation<BackendPayoutResponse>(path, body);
  return mapPayout(response.payout);
}

function mapPayout(payout: BackendPayout): AdminPayout {
  return {
    id: payout.id,
    instructorName:
      payout.instructor?.displayName?.trim() ||
      payout.instructor?.username?.trim() ||
      payout.instructor?.email?.trim() ||
      "Formateur Certilys",
    instructorHandle: payout.instructor?.username?.trim() || "",
    amount: payout.totalAmount,
    currency: payout.currency || "XOF",
    destination: mapDestination(payout.method),
    triggerType: payout.triggerType,
    requestedAt: payout.initiatedAt ?? payout.createdAt,
    status: payout.status,
    processedAt: payout.completedAt,
    failureReason: payout.failureReason ?? null,
    provider: payout.provider,
    providerPayoutId: payout.providerPayoutId ?? null,
    providerStatus: payout.providerStatus ?? null,
    runPeriod: payout.runPeriod ?? null,
    retryable: payout.retryable ?? false,
    requiresReconciliation: payout.requiresReconciliation ?? false,
    lastSyncedAt: payout.lastSyncedAt ?? null,
    reconciliationAttempts: payout.reconciliationAttempts ?? 0,
    statusReason: payout.statusReason ?? null,
  };
}

function mapDestination(method: BackendPayout["method"]): AdminPayoutDestination {
  if (!method) return { type: "UNKNOWN", label: "Méthode non renseignée" };
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

// ─────────────────────────────────────────────────────────────────────────────
// Données mock — Reversements formateurs
//
// Mêmes conventions que les autres domaines (admin-users-data.ts, …). L'UI tourne
// sur ces mocks ; le contrat d'API réel à implémenter côté backend est décrit
// dans PAYOUTS-API-SPEC.md à la racine du repo.
// ─────────────────────────────────────────────────────────────────────────────

export type PayoutStatus = "PENDING" | "PAID" | "REJECTED";

// Coordonnées de versement, selon le moyen choisi par le formateur.
export type PayoutDestination =
  | { type: "MOBILE_MONEY"; network: string; phone: string }
  | {
      type: "BANK_TRANSFER";
      holder: string; // titulaire du compte
      bankName: string;
      iban: string; // UEMOA, 27-28 caractères
      bic: string; // BIC / SWIFT
    };

export interface AdminPayout {
  id: string;
  instructorName: string;
  instructorHandle: string;
  amount: number; // en XOF
  destination: PayoutDestination;
  requestedAt: string; // ISO
  status: PayoutStatus;
  processedAt?: string; // ISO, si traité
}

// ─────────────────────────────────────────────────────────────────────────────
// Config badges
// ─────────────────────────────────────────────────────────────────────────────

export const PAYOUT_STATUS_CONFIG: Record<
  PayoutStatus,
  { label: string; colorClass: string; dotClass: string }
> = {
  PENDING: {
    label: "En attente",
    colorClass: "text-chart-4 border-chart-4/40 bg-chart-4/10",
    dotClass: "bg-chart-4",
  },
  PAID: {
    label: "Payé",
    colorClass: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    dotClass: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejeté",
    colorClass: "text-muted-foreground border-border bg-muted/50",
    dotClass: "bg-muted-foreground",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Jeu de données mock
// ─────────────────────────────────────────────────────────────────────────────

export const mockAdminPayouts: AdminPayout[] = [
  {
    id: "po_8f31",
    instructorName: "Amadou Diallo",
    instructorHandle: "amadou-diallo",
    amount: 100_000,
    destination: {
      type: "MOBILE_MONEY",
      network: "MTN Mobile Money",
      phone: "+229 90 41 87 02",
    },
    requestedAt: "2026-06-25T09:12:00.000Z",
    status: "PENDING",
  },
  {
    id: "po_2c90",
    instructorName: "Sarah Mensah",
    instructorHandle: "sarah-mensah",
    amount: 212_000,
    destination: {
      type: "BANK_TRANSFER",
      holder: "Sarah Mensah",
      bankName: "Bank of Africa (BOA)",
      iban: "CI52 CI05 9000 1122 3344 5566 77",
      bic: "AFRICIAB",
    },
    requestedAt: "2026-06-24T18:40:00.000Z",
    status: "PENDING",
  },
  {
    id: "po_5a17",
    instructorName: "Koffi Mensah",
    instructorHandle: "koffi-mensah",
    amount: 75_000,
    destination: {
      type: "MOBILE_MONEY",
      network: "Moov Money",
      phone: "+228 90 55 19 04",
    },
    requestedAt: "2026-06-24T11:05:00.000Z",
    status: "PENDING",
  },
  {
    id: "po_1b44",
    instructorName: "Fatou Diop",
    instructorHandle: "fatou-diop",
    amount: 340_000,
    destination: {
      type: "MOBILE_MONEY",
      network: "Orange Money",
      phone: "+221 77 88 30 11",
    },
    requestedAt: "2026-06-22T14:22:00.000Z",
    status: "PAID",
    processedAt: "2026-06-23T08:10:00.000Z",
  },
  {
    id: "po_9d72",
    instructorName: "Awa Traoré",
    instructorHandle: "awa-traore",
    amount: 58_000,
    destination: {
      type: "BANK_TRANSFER",
      holder: "Awa Traoré",
      bankName: "Ecobank Côte d'Ivoire",
      iban: "CI93 CI05 0000 1234 5678 9012 34",
      bic: "ECOCCIAB",
    },
    requestedAt: "2026-06-21T10:00:00.000Z",
    status: "PAID",
    processedAt: "2026-06-22T09:30:00.000Z",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function methodLabel(d: PayoutDestination): string {
  return d.type === "MOBILE_MONEY" ? "Mobile Money" : "Virement bancaire";
}

/** Résumé court affiché dans la ligne du tableau. */
export function destinationSummary(d: PayoutDestination): string {
  return d.type === "MOBILE_MONEY"
    ? `${d.network} · ${d.phone}`
    : `${d.bankName} · ${d.iban}`;
}

export function formatXOF(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} XOF`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

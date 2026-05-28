// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type TrendDirection = "up" | "down" | "neutral";

export interface SparklinePoint {
  value: number;
}

export interface DashboardKpi {
  id: string;
  label: string;
  value: number;
  /** Valeur affichée côté UI (formatée) */
  displayValue: string;
  currency?: "XOF";
  /** Ex: "+8.2%" ou "-3.1%" */
  trend: string;
  trendDirection: TrendDirection;
  /** Libellé accessible du badge tendance */
  trendLabel: string;
  context: string;
  sparkline: SparklinePoint[];
}

export interface RevenuePoint {
  date: string;
  /** CA brut en XOF */
  caBrut: number;
  /** Commission Certilys en XOF */
  commission: number;
}

export interface ValidationPoint {
  date: string;
  candidatures: number;
  formateursApprouves: number;
  formationsSoumises: number;
  formationsApprouvees: number;
}

export type ActionUrgency = "critical" | "warning" | "info";

export interface PriorityAction {
  id: string;
  label: string;
  count: number;
  urgency: ActionUrgency;
  href: string;
}

export interface RecentOrder {
  id: string;
  client: string;
  formation: string;
  /** Montant en XOF */
  montant: number;
  currency: "XOF";
  statut: OrderStatus;
  date: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export const kpiData: DashboardKpi[] = [
  {
    id: "ca-brut",
    label: "CA brut du mois",
    value: 4_850_000,
    displayValue: "4 850 000 F CFA",
    currency: "XOF",
    trend: "+12.4%",
    trendDirection: "up",
    trendLabel: "En hausse de 12,4% vs mois précédent",
    context: "vs mois précédent",
    sparkline: [
      { value: 2800000 },
      { value: 3100000 },
      { value: 2950000 },
      { value: 3400000 },
      { value: 3700000 },
      { value: 4100000 },
      { value: 3900000 },
      { value: 4300000 },
      { value: 4600000 },
      { value: 4850000 },
    ],
  },
  {
    id: "commission",
    label: "Commission Certilys",
    value: 727_500,
    displayValue: "727 500 F CFA",
    currency: "XOF",
    trend: "+12.4%",
    trendDirection: "up",
    trendLabel: "En hausse de 12,4% vs mois précédent",
    context: "15% du CA brut — vs mois précédent",
    sparkline: [
      { value: 420000 },
      { value: 465000 },
      { value: 442500 },
      { value: 510000 },
      { value: 555000 },
      { value: 615000 },
      { value: 585000 },
      { value: 645000 },
      { value: 690000 },
      { value: 727500 },
    ],
  },
  {
    id: "formateurs-attente",
    label: "Formateurs en attente",
    value: 7,
    displayValue: "7",
    trend: "+3",
    trendDirection: "down",
    trendLabel: "3 nouveaux depuis hier — action requise",
    context: "Depuis les 30 derniers jours",
    sparkline: [
      { value: 2 },
      { value: 3 },
      { value: 2 },
      { value: 4 },
      { value: 3 },
      { value: 5 },
      { value: 4 },
      { value: 6 },
      { value: 5 },
      { value: 7 },
    ],
  },
  {
    id: "formations-valider",
    label: "Formations à valider",
    value: 12,
    displayValue: "12",
    trend: "+5",
    trendDirection: "down",
    trendLabel: "5 nouvelles soumissions — action requise",
    context: "Depuis les 30 derniers jours",
    sparkline: [
      { value: 4 },
      { value: 5 },
      { value: 6 },
      { value: 5 },
      { value: 7 },
      { value: 8 },
      { value: 9 },
      { value: 10 },
      { value: 11 },
      { value: 12 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Revenue Chart Mock (30 derniers jours)
// ─────────────────────────────────────────────────────────────────────────────

function generateRevenueData(): RevenuePoint[] {
  const data: RevenuePoint[] = [];
  const today = new Date("2026-05-28");

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const base = 100_000 + Math.floor(Math.random() * 250_000);
    const variation = Math.floor(Math.sin(i * 0.4) * 80_000);
    const caBrut = Math.max(50_000, base + variation);
    const commission = Math.round(caBrut * 0.15);

    data.push({ date: dateStr, caBrut, commission });
  }

  return data;
}

export const revenueData: RevenuePoint[] = [
  { date: "2026-04-29", caBrut: 145000, commission: 21750 },
  { date: "2026-04-30", caBrut: 198000, commission: 29700 },
  { date: "2026-05-01", caBrut: 87000, commission: 13050 },
  { date: "2026-05-02", caBrut: 215000, commission: 32250 },
  { date: "2026-05-03", caBrut: 162000, commission: 24300 },
  { date: "2026-05-04", caBrut: 54000, commission: 8100 },
  { date: "2026-05-05", caBrut: 73000, commission: 10950 },
  { date: "2026-05-06", caBrut: 234000, commission: 35100 },
  { date: "2026-05-07", caBrut: 289000, commission: 43350 },
  { date: "2026-05-08", caBrut: 178000, commission: 26700 },
  { date: "2026-05-09", caBrut: 312000, commission: 46800 },
  { date: "2026-05-10", caBrut: 195000, commission: 29250 },
  { date: "2026-05-11", caBrut: 68000, commission: 10200 },
  { date: "2026-05-12", caBrut: 91000, commission: 13650 },
  { date: "2026-05-13", caBrut: 267000, commission: 40050 },
  { date: "2026-05-14", caBrut: 345000, commission: 51750 },
  { date: "2026-05-15", caBrut: 223000, commission: 33450 },
  { date: "2026-05-16", caBrut: 189000, commission: 28350 },
  { date: "2026-05-17", caBrut: 156000, commission: 23400 },
  { date: "2026-05-18", caBrut: 78000, commission: 11700 },
  { date: "2026-05-19", caBrut: 112000, commission: 16800 },
  { date: "2026-05-20", caBrut: 298000, commission: 44700 },
  { date: "2026-05-21", caBrut: 367000, commission: 55050 },
  { date: "2026-05-22", caBrut: 245000, commission: 36750 },
  { date: "2026-05-23", caBrut: 189000, commission: 28350 },
  { date: "2026-05-24", caBrut: 134000, commission: 20100 },
  { date: "2026-05-25", caBrut: 89000, commission: 13350 },
  { date: "2026-05-26", caBrut: 278000, commission: 41700 },
  { date: "2026-05-27", caBrut: 412000, commission: 61800 },
  { date: "2026-05-28", caBrut: 321000, commission: 48150 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Validation Chart Mock (30 derniers jours)
// ─────────────────────────────────────────────────────────────────────────────

export const validationData: ValidationPoint[] = [
  { date: "S1 Mai", candidatures: 14, formateursApprouves: 8, formationsSoumises: 22, formationsApprouvees: 17 },
  { date: "S2 Mai", candidatures: 18, formateursApprouves: 11, formationsSoumises: 28, formationsApprouvees: 21 },
  { date: "S3 Mai", candidatures: 12, formateursApprouves: 9, formationsSoumises: 19, formationsApprouvees: 15 },
  { date: "S4 Mai", candidatures: 21, formateursApprouves: 14, formationsSoumises: 34, formationsApprouvees: 26 },
  { date: "S1 Avr", candidatures: 9, formateursApprouves: 6, formationsSoumises: 15, formationsApprouvees: 11 },
  { date: "S2 Avr", candidatures: 16, formateursApprouves: 12, formationsSoumises: 24, formationsApprouvees: 19 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Priority Actions Mock
// ─────────────────────────────────────────────────────────────────────────────

export const priorityActions: PriorityAction[] = [
  {
    id: "formateurs-pending",
    label: "Formateurs en attente de validation",
    count: 7,
    urgency: "critical",
    href: "/dashboard/instructors?status=PENDING",
  },
  {
    id: "formations-submitted",
    label: "Formations soumises à révision",
    count: 12,
    urgency: "critical",
    href: "/dashboard/courses",
  },
  {
    id: "paiements-verifier",
    label: "Paiements à vérifier",
    count: 3,
    urgency: "warning",
    href: "/dashboard/orders",
  },
  {
    id: "acces-revoques",
    label: "Accès révoqués à traiter",
    count: 2,
    urgency: "warning",
    href: "/dashboard/users",
  },
  {
    id: "audit-logs",
    label: "Événements d'audit non examinés",
    count: 18,
    urgency: "info",
    href: "/dashboard/audit-logs",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Recent Orders Mock
// ─────────────────────────────────────────────────────────────────────────────

export const recentOrders: RecentOrder[] = [
  {
    id: "ORD-2026-0412",
    client: "Amadou Diallo",
    formation: "Gestion de projet Agile",
    montant: 185000,
    currency: "XOF",
    statut: "PAID",
    date: "2026-05-28",
  },
  {
    id: "ORD-2026-0411",
    client: "Fatou Ndiaye",
    formation: "Comptabilité OHADA avancée",
    montant: 250000,
    currency: "XOF",
    statut: "PENDING",
    date: "2026-05-27",
  },
  {
    id: "ORD-2026-0410",
    client: "Koffi Mensah",
    formation: "Marketing Digital & SEO",
    montant: 120000,
    currency: "XOF",
    statut: "APPROVED",
    date: "2026-05-26",
  },
  {
    id: "ORD-2026-0409",
    client: "Awa Traoré",
    formation: "Leadership & Management",
    montant: 320000,
    currency: "XOF",
    statut: "CHANGES_REQUESTED",
    date: "2026-05-25",
  },
  {
    id: "ORD-2026-0408",
    client: "Ibrahim Coulibaly",
    formation: "Excel & Analyse de données",
    montant: 95000,
    currency: "XOF",
    statut: "FAILED",
    date: "2026-05-24",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function formatXOF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " F CFA";
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export const orderStatusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; colorClass: string }
> = {
  PENDING: { label: "En attente", variant: "outline", colorClass: "text-amber-500 border-amber-500/40 bg-amber-500/10" },
  APPROVED: { label: "Approuvée", variant: "outline", colorClass: "text-emerald-500 border-emerald-500/40 bg-emerald-500/10" },
  REJECTED: { label: "Rejetée", variant: "outline", colorClass: "text-red-500 border-red-500/40 bg-red-500/10" },
  CHANGES_REQUESTED: { label: "Révision", variant: "outline", colorClass: "text-orange-500 border-orange-500/40 bg-orange-500/10" },
  PAID: { label: "Payée", variant: "outline", colorClass: "text-primary border-primary/40 bg-primary/10" },
  FAILED: { label: "Échouée", variant: "destructive", colorClass: "text-destructive border-destructive/40 bg-destructive/10" },
  REFUNDED: { label: "Remboursée", variant: "outline", colorClass: "text-muted-foreground border-border bg-muted/40" },
};

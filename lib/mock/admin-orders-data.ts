// ─────────────────────────────────────────────────────────────────────────────
// Types supervision Commandes et Paiements
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "INITIATED"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type AccessStatus = "ACTIVE" | "REVOKED" | "EXPIRED" | "NOT_CREATED";

export interface BillingSnapshot {
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  taxId?: string; // NIF ou TVA locale
}

export interface PaymentProviderPayload {
  event: string;
  data: Record<string, any>;
  [key: string]: any;
}

export interface OrderEvent {
  title: string;
  date: string;
  description: string;
}

export interface AdminOrder {
  id: string;
  orderKind?: "COURSE" | "LEONO_CREDITS";
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  accessStatus: AccessStatus;
  createdAt: string;
  updatedAt: string;
  amountXOF: number;       // Montant brut de la formation
  discountXOF: number;     // Remise appliquée
  totalXOF: number;        // Total net payé
  channel: "LINK" | "PLATFORM"; // Origine : lien formateur (Certilys 40%) ou Certilys (70%)
  commissionRate: number;  // Taux de commission Certilys (40 ou 70 selon le canal)
  commissionXOF: number;   // Part Certilys (commissionRate % du totalXOF)
  netInstructorXOF: number;// Part formateur (totalXOF - commissionXOF)
  apprenant: {
    name: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    role?: string;
  };
  leonoPurchase?: {
    packId: string;
    label: string;
    credits: number;
    amountXOF: number;
    currency: string;
    creditedAt: string | null;
  } | null;
  formation: {
    id: string;
    title: string;
    instructorName: string;
    priceXOF: number;
    status: string;
  };
  billingSnapshot: BillingSnapshot;
  paiement: {
    provider: "MONEROO";
    sessionId: string;
    paymentId?: string;
    paidAt?: string;
    failedAt?: string;
    refundedAt?: string;
    rawPayload: PaymentProviderPayload;
  };
  access: {
    enrollmentId?: string;
    progressPercent?: number;
    createdAt?: string;
    revokedAt?: string;
    revocationReason?: string;
  };
  events: OrderEvent[];
}

export interface OrderKpi {
  id: string;
  label: string;
  value: string | number;
  iconBg: string;
  colorClass: string;
  status: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatage et helpers de base
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

// ─────────────────────────────────────────────────────────────────────────────
// Configurations visuelles
// ─────────────────────────────────────────────────────────────────────────────

export const orderStatusConfig: Record<
  OrderStatus,
  { label: string; dotClass: string; colorClass: string }
> = {
  INITIATED: { label: "Initiée", dotClass: "bg-blue-500", colorClass: "text-blue-600 border-blue-500/20 bg-blue-500/5" },
  PAID: { label: "Payée", dotClass: "bg-emerald-500", colorClass: "text-emerald-600 border-emerald-500/20 bg-emerald-500/5" },
  CANCELLED: { label: "Annulée", dotClass: "bg-red-500", colorClass: "text-red-600 border-red-500/20 bg-red-500/5" },
  EXPIRED: { label: "Expirée", dotClass: "bg-neutral-400", colorClass: "text-neutral-600 border-border bg-neutral-500/5" },
  REFUNDED: { label: "Remboursée", dotClass: "bg-amber-500", colorClass: "text-amber-600 border-amber-500/20 bg-amber-500/5" },
};

export const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; dotClass: string; colorClass: string }
> = {
  PENDING: { label: "En attente", dotClass: "bg-amber-500", colorClass: "text-amber-600 border-amber-500/30 bg-amber-500/5" },
  COMPLETED: { label: "Complété", dotClass: "bg-emerald-500", colorClass: "text-emerald-600 border-emerald-500/30 bg-emerald-500/5" },
  FAILED: { label: "Échoué", dotClass: "bg-red-500", colorClass: "text-red-600 border-red-500/30 bg-red-500/5" },
  REFUNDED: { label: "Remboursé", dotClass: "bg-neutral-500", colorClass: "text-neutral-600 border-border bg-neutral-500/5" },
};

export const accessStatusConfig: Record<
  AccessStatus,
  { label: string; dotClass: string; colorClass: string }
> = {
  ACTIVE: { label: "Actif", dotClass: "bg-emerald-500", colorClass: "text-emerald-600 border-emerald-500/20 bg-emerald-500/5" },
  REVOKED: { label: "Révoqué", dotClass: "bg-red-500", colorClass: "text-red-600 border-red-500/20 bg-red-500/5" },
  EXPIRED: { label: "Expiré", dotClass: "bg-neutral-500", colorClass: "text-neutral-600 border-border bg-neutral-500/5" },
  NOT_CREATED: { label: "Non créé", dotClass: "bg-amber-500", colorClass: "text-amber-600 border-amber-500/20 bg-amber-500/5" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Données Mock des Commandes
// ─────────────────────────────────────────────────────────────────────────────

export const mockOrders: AdminOrder[] = [
  {
    id: "ORD-2026-0412",
    orderStatus: "PAID",
    paymentStatus: "COMPLETED",
    accessStatus: "ACTIVE",
    createdAt: "2026-05-28T14:30:00Z",
    updatedAt: "2026-05-28T14:32:15Z",
    amountXOF: 185000,
    discountXOF: 15000,
    totalXOF: 170000,
    channel: "LINK",
    commissionRate: 40,
    commissionXOF: 68000,
    netInstructorXOF: 102000,
    apprenant: {
      name: "Amadou Diallo",
      email: "amadou.diallo@gmail.com",
      phone: "+221 77 123 45 67",
      country: "Sénégal",
      city: "Dakar",
    },
    formation: {
      id: "course-1",
      title: "Initiation au Design System avec Tailwind",
      instructorName: "Sarah Diop",
      priceXOF: 185000,
      status: "APPROVED",
    },
    billingSnapshot: {
      name: "Amadou Diallo",
      address: "12 Rue des Hydrocarbures, Bel-Air",
      city: "Dakar",
      postalCode: "10000",
      country: "Sénégal",
      taxId: "SN-NINEA-20260401",
    },
    paiement: {
      provider: "MONEROO",
      sessionId: "mon_session_9af81c03e23",
      paymentId: "mon_pay_823ab19de01",
      paidAt: "2026-05-28T14:32:15Z",
      rawPayload: {
        event: "payment.completed",
        data: {
          id: "mon_pay_823ab19de01",
          session_id: "mon_session_9af81c03e23",
          amount: 170000,
          currency: "XOF",
          status: "completed",
          payment_method: "orange_money_sn",
          customer: {
            name: "Amadou Diallo",
            email: "amadou.diallo@gmail.com",
          },
          metadata: {
            order_id: "ORD-2026-0412",
          },
          created_at: "2026-05-28T14:30:00Z",
          completed_at: "2026-05-28T14:32:15Z",
        },
      },
    },
    access: {
      enrollmentId: "enr-89102",
      progressPercent: 35,
      createdAt: "2026-05-28T14:33:00Z",
    },
    events: [
      { title: "Commande initiée", date: "2026-05-28T14:30:00Z", description: "Le client a initié l'achat de la formation." },
      { title: "Webhook Moneroo reçu", date: "2026-05-28T14:32:15Z", description: "Paiement de 170 000 F CFA complété avec succès via Orange Money." },
      { title: "Accès activé", date: "2026-05-28T14:33:00Z", description: "L'inscription de l'apprenant a été créée à l'état ACTIF." },
    ],
  },
  {
    id: "ORD-2026-0411",
    orderStatus: "INITIATED",
    paymentStatus: "PENDING",
    accessStatus: "NOT_CREATED",
    createdAt: "2026-05-27T09:15:00Z",
    updatedAt: "2026-05-27T09:15:00Z",
    amountXOF: 250000,
    discountXOF: 0,
    totalXOF: 250000,
    channel: "PLATFORM",
    commissionRate: 70,
    commissionXOF: 175000,
    netInstructorXOF: 75000,
    apprenant: {
      name: "Fatou Ndiaye",
      email: "fatou.ndiaye@yahoo.fr",
      phone: "+221 78 987 65 43",
      country: "Sénégal",
      city: "Saint-Louis",
    },
    formation: {
      id: "course-2",
      title: "Comptabilité OHADA avancée",
      instructorName: "Sarah Diop",
      priceXOF: 250000,
      status: "APPROVED",
    },
    billingSnapshot: {
      name: "Fatou Ndiaye",
      address: "Quartier Sindoné, Rue 5",
      city: "Saint-Louis",
      country: "Sénégal",
    },
    paiement: {
      provider: "MONEROO",
      sessionId: "mon_session_7cb12a091d8",
      rawPayload: {
        event: "payment.initiated",
        data: {
          session_id: "mon_session_7cb12a091d8",
          amount: 250000,
          currency: "XOF",
          status: "pending",
          customer: {
            name: "Fatou Ndiaye",
            email: "fatou.ndiaye@yahoo.fr",
          },
          metadata: {
            order_id: "ORD-2026-0411",
          },
          created_at: "2026-05-27T09:15:00Z",
        },
      },
    },
    access: {},
    events: [
      { title: "Commande initiée", date: "2026-05-27T09:15:00Z", description: "Le client a initié l'achat et a été redirigé vers la passerelle Moneroo." },
    ],
  },
  {
    id: "ORD-2026-0410",
    orderStatus: "PAID",
    paymentStatus: "COMPLETED",
    accessStatus: "ACTIVE",
    createdAt: "2026-05-26T18:22:00Z",
    updatedAt: "2026-05-26T18:24:10Z",
    amountXOF: 120000,
    discountXOF: 0,
    totalXOF: 120000,
    channel: "LINK",
    commissionRate: 40,
    commissionXOF: 48000,
    netInstructorXOF: 72000,
    apprenant: {
      name: "Koffi Mensah",
      email: "koffi.mensah@gmail.com",
      phone: "+228 90 12 34 56",
      country: "Togo",
      city: "Lomé",
    },
    formation: {
      id: "course-3",
      title: "Marketing Digital & SEO",
      instructorName: "Sarah Diop",
      priceXOF: 120000,
      status: "APPROVED",
    },
    billingSnapshot: {
      name: "Koffi Mensah",
      address: "Avenue de la Libération, Bp 14",
      city: "Lomé",
      country: "Togo",
    },
    paiement: {
      provider: "MONEROO",
      sessionId: "mon_session_5ba78b102ce",
      paymentId: "mon_pay_902ca819b02",
      paidAt: "2026-05-26T18:24:10Z",
      rawPayload: {
        event: "payment.completed",
        data: {
          id: "mon_pay_902ca819b02",
          session_id: "mon_session_5ba78b102ce",
          amount: 120000,
          currency: "XOF",
          status: "completed",
          payment_method: "t-money",
          customer: {
            name: "Koffi Mensah",
            email: "koffi.mensah@gmail.com",
          },
          metadata: {
            order_id: "ORD-2026-0410",
          },
          created_at: "2026-05-26T18:22:00Z",
          completed_at: "2026-05-26T18:24:10Z",
        },
      },
    },
    access: {
      enrollmentId: "enr-723ab8",
      progressPercent: 88,
      createdAt: "2026-05-26T18:25:00Z",
    },
    events: [
      { title: "Commande initiée", date: "2026-05-26T18:22:00Z", description: "Le client a initié l'achat de la formation." },
      { title: "Webhook Moneroo reçu", date: "2026-05-26T18:24:10Z", description: "Paiement de 120 000 F CFA complété avec succès via T-Money." },
      { title: "Accès activé", date: "2026-05-26T18:25:00Z", description: "L'inscription de l'apprenant a été créée à l'état ACTIF." },
    ],
  },
  {
    id: "ORD-2026-0409",
    orderStatus: "CANCELLED",
    paymentStatus: "FAILED",
    accessStatus: "NOT_CREATED",
    createdAt: "2026-05-25T11:05:00Z",
    updatedAt: "2026-05-25T11:20:00Z",
    amountXOF: 320000,
    discountXOF: 40000,
    totalXOF: 280000,
    channel: "PLATFORM",
    commissionRate: 70,
    commissionXOF: 196000,
    netInstructorXOF: 84000,
    apprenant: {
      name: "Awa Traoré",
      email: "awa.traore@outlook.com",
      phone: "+223 66 12 34 56",
      country: "Mali",
      city: "Bamako",
    },
    formation: {
      id: "course-4",
      title: "Leadership & Management",
      instructorName: "Sarah Diop",
      priceXOF: 320000,
      status: "APPROVED",
    },
    billingSnapshot: {
      name: "Awa Traoré",
      address: "Quartier du Fleuve, Rue 310",
      city: "Bamako",
      country: "Mali",
    },
    paiement: {
      provider: "MONEROO",
      sessionId: "mon_session_3fe12b083a2",
      failedAt: "2026-05-25T11:20:00Z",
      rawPayload: {
        event: "payment.failed",
        data: {
          session_id: "mon_session_3fe12b083a2",
          amount: 280000,
          currency: "XOF",
          status: "failed",
          failure_reason: "insufficient_funds",
          customer: {
            name: "Awa Traoré",
            email: "awa.traore@outlook.com",
          },
          metadata: {
            order_id: "ORD-2026-0409",
          },
          created_at: "2026-05-25T11:05:00Z",
          failed_at: "2026-05-25T11:20:00Z",
        },
      },
    },
    access: {},
    events: [
      { title: "Commande initiée", date: "2026-05-25T11:05:00Z", description: "Le client a initié l'achat." },
      { title: "Échec de paiement", date: "2026-05-25T11:20:00Z", description: "La transaction a échoué pour le motif : Fonds insuffisants." },
    ],
  },
  {
    id: "ORD-2026-0408",
    orderStatus: "PAID",
    paymentStatus: "REFUNDED",
    accessStatus: "REVOKED",
    createdAt: "2026-05-24T15:40:00Z",
    updatedAt: "2026-05-25T16:00:00Z",
    amountXOF: 95000,
    discountXOF: 0,
    totalXOF: 95000,
    channel: "LINK",
    commissionRate: 40,
    commissionXOF: 38000,
    netInstructorXOF: 57000,
    apprenant: {
      name: "Ibrahim Coulibaly",
      email: "ibrahim.coulibaly@gmail.com",
      phone: "+225 07 45 67 89 01",
      country: "Côte d'Ivoire",
      city: "Abidjan",
    },
    formation: {
      id: "course-5",
      title: "Excel & Analyse de données",
      instructorName: "Sarah Diop",
      priceXOF: 95000,
      status: "APPROVED",
    },
    billingSnapshot: {
      name: "Ibrahim Coulibaly",
      address: "Cocody Angré, Boulevard Latrille",
      city: "Abidjan",
      country: "Côte d'Ivoire",
    },
    paiement: {
      provider: "MONEROO",
      sessionId: "mon_session_1ea92c074f3",
      paymentId: "mon_pay_392ab81c903",
      paidAt: "2026-05-24T15:42:00Z",
      refundedAt: "2026-05-25T16:00:00Z",
      rawPayload: {
        event: "payment.refunded",
        data: {
          id: "mon_pay_392ab81c903",
          session_id: "mon_session_1ea92c074f3",
          amount: 95000,
          currency: "XOF",
          status: "refunded",
          customer: {
            name: "Ibrahim Coulibaly",
            email: "ibrahim.coulibaly@gmail.com",
          },
          metadata: {
            order_id: "ORD-2026-0408",
          },
          created_at: "2026-05-24T15:40:00Z",
          refunded_at: "2026-05-25T16:00:00Z",
        },
      },
    },
    access: {
      enrollmentId: "enr-612a93",
      progressPercent: 5,
      createdAt: "2026-05-24T15:45:00Z",
      revokedAt: "2026-05-25T16:05:00Z",
      revocationReason: "Remboursement demandé et traité par le support client.",
    },
    events: [
      { title: "Commande initiée", date: "2026-05-24T15:40:00Z", description: "Le client a initié l'achat de la formation." },
      { title: "Webhook Moneroo reçu", date: "2026-05-24T15:42:00Z", description: "Paiement de 95 000 F CFA complété avec succès." },
      { title: "Accès activé", date: "2026-05-24T15:45:00Z", description: "L'inscription de l'apprenant a été créée à l'état ACTIF." },
      { title: "Remboursement Moneroo", date: "2026-05-25T16:00:00Z", description: "Webhook de remboursement intégral reçu de Moneroo." },
      { title: "Accès révoqué", date: "2026-05-25T16:05:00Z", description: "L'accès à la formation a été révoqué suite au remboursement." },
    ],
  },
  {
    // Anomalie pédagogique simulée : paiement COMPLETED mais aucun accès encore créé (NOT_CREATED)
    id: "ORD-2026-0407",
    orderStatus: "PAID",
    paymentStatus: "COMPLETED",
    accessStatus: "NOT_CREATED",
    createdAt: "2026-05-23T10:12:00Z",
    updatedAt: "2026-05-23T10:13:50Z",
    amountXOF: 185000,
    discountXOF: 0,
    totalXOF: 185000,
    channel: "PLATFORM",
    commissionRate: 70,
    commissionXOF: 129500,
    netInstructorXOF: 55500,
    apprenant: {
      name: "Bamba Fofana",
      email: "bamba.fofana@gmail.com",
      phone: "+225 01 02 03 04 05",
      country: "Côte d'Ivoire",
      city: "Yamoussoukro",
    },
    formation: {
      id: "course-1",
      title: "Initiation au Design System avec Tailwind",
      instructorName: "Sarah Diop",
      priceXOF: 185000,
      status: "APPROVED",
    },
    billingSnapshot: {
      name: "Bamba Fofana",
      address: "Avenue Houphouët-Boigny",
      city: "Yamoussoukro",
      country: "Côte d'Ivoire",
    },
    paiement: {
      provider: "MONEROO",
      sessionId: "mon_session_2ab91c083fe",
      paymentId: "mon_pay_482bc91cd04",
      paidAt: "2026-05-23T10:13:50Z",
      rawPayload: {
        event: "payment.completed",
        data: {
          id: "mon_pay_482bc91cd04",
          session_id: "mon_session_2ab91c083fe",
          amount: 185000,
          currency: "XOF",
          status: "completed",
          payment_method: "mtn_ci",
          customer: {
            name: "Bamba Fofana",
            email: "bamba.fofana@gmail.com",
          },
          metadata: {
            order_id: "ORD-2026-0407",
          },
          created_at: "2026-05-23T10:12:00Z",
          completed_at: "2026-05-23T10:13:50Z",
        },
      },
    },
    access: {},
    events: [
      { title: "Commande initiée", date: "2026-05-23T10:12:00Z", description: "Le client a initié l'achat de la formation." },
      { title: "Webhook Moneroo reçu", date: "2026-05-23T10:13:50Z", description: "Paiement de 185 000 F CFA complété avec succès via MTN Mobile Money." },
      { title: "Échec de provisionnement d'accès", date: "2026-05-23T10:14:00Z", description: "Le webhook n'a pas pu créer l'inscription suite à un timeout de la base de données. Action requise." },
    ],
  },
  {
    id: "ORD-2026-0406",
    orderStatus: "EXPIRED",
    paymentStatus: "PENDING",
    accessStatus: "NOT_CREATED",
    createdAt: "2026-05-22T14:00:00Z",
    updatedAt: "2026-05-22T15:00:00Z",
    amountXOF: 150000,
    discountXOF: 15000,
    totalXOF: 135000,
    channel: "LINK",
    commissionRate: 40,
    commissionXOF: 54000,
    netInstructorXOF: 81000,
    apprenant: {
      name: "Marie-Louise Dupont",
      email: "ml.dupont@gmail.com",
      phone: "+33 6 12 34 56 78",
      country: "France",
      city: "Paris",
    },
    formation: {
      id: "course-6",
      title: "Gestion d'entreprise & KPIs",
      instructorName: "Sarah Diop",
      priceXOF: 150000,
      status: "APPROVED",
    },
    billingSnapshot: {
      name: "Marie-Louise Dupont",
      address: "45 Rue de la Pompe",
      city: "Paris",
      postalCode: "75016",
      country: "France",
    },
    paiement: {
      provider: "MONEROO",
      sessionId: "mon_session_9fa82d018cb",
      rawPayload: {
        event: "payment.session_expired",
        data: {
          session_id: "mon_session_9fa82d018cb",
          amount: 135000,
          currency: "XOF",
          status: "expired",
          customer: {
            name: "Marie-Louise Dupont",
            email: "ml.dupont@gmail.com",
          },
          metadata: {
            order_id: "ORD-2026-0406",
          },
          created_at: "2026-05-22T14:00:00Z",
          expired_at: "2026-05-22T15:00:00Z",
        },
      },
    },
    access: {},
    events: [
      { title: "Commande initiée", date: "2026-05-22T14:00:00Z", description: "Le client a initié l'achat." },
      { title: "Session expirée", date: "2026-05-22T15:00:00Z", description: "Le délai d'attente pour le paiement sur la passerelle est expiré." },
    ],
  },
  {
    id: "ORD-2026-0405",
    orderStatus: "PAID",
    paymentStatus: "COMPLETED",
    accessStatus: "ACTIVE",
    createdAt: "2026-05-21T09:10:00Z",
    updatedAt: "2026-05-21T09:12:05Z",
    amountXOF: 250000,
    discountXOF: 0,
    totalXOF: 250000,
    channel: "PLATFORM",
    commissionRate: 70,
    commissionXOF: 175000,
    netInstructorXOF: 75000,
    apprenant: {
      name: "Alioune Badara",
      email: "badara.alioune@gmail.com",
      phone: "+221 70 543 21 09",
      country: "Sénégal",
      city: "Thies",
    },
    formation: {
      id: "course-2",
      title: "Comptabilité OHADA avancée",
      instructorName: "Sarah Diop",
      priceXOF: 250000,
      status: "APPROVED",
    },
    billingSnapshot: {
      name: "Alioune Badara",
      address: "Quartier Escale, Avenue Léopold Sédar Senghor",
      city: "Thies",
      country: "Sénégal",
    },
    paiement: {
      provider: "MONEROO",
      sessionId: "mon_session_3ba28f192da",
      paymentId: "mon_pay_192ab830d92",
      paidAt: "2026-05-21T09:12:05Z",
      rawPayload: {
        event: "payment.completed",
        data: {
          id: "mon_pay_192ab830d92",
          session_id: "mon_session_3ba28f192da",
          amount: 250000,
          currency: "XOF",
          status: "completed",
          payment_method: "wave_sn",
          customer: {
            name: "Alioune Badara",
            email: "badara.alioune@gmail.com",
          },
          metadata: {
            order_id: "ORD-2026-0405",
          },
          created_at: "2026-05-21T09:10:00Z",
          completed_at: "2026-05-21T09:12:05Z",
        },
      },
    },
    access: {
      enrollmentId: "enr-901bce",
      progressPercent: 12,
      createdAt: "2026-05-21T09:15:00Z",
    },
    events: [
      { title: "Commande initiée", date: "2026-05-21T09:10:00Z", description: "Le client a initié l'achat." },
      { title: "Webhook Moneroo reçu", date: "2026-05-21T09:12:05Z", description: "Paiement de 250 000 F CFA complété avec succès via Wave." },
      { title: "Accès activé", date: "2026-05-21T09:15:00Z", description: "L'inscription de l'apprenant a été créée à l'état ACTIF." },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// KPIs pour le Dashboard / listes
// ─────────────────────────────────────────────────────────────────────────────

export const courseReviewKpis = [
  {
    id: "ca-brut",
    label: "CA brut",
    value: formatXOF(1085000), // Somme des totalXOF COMPLETED
    colorClass: "text-emerald-600",
    iconBg: "bg-emerald-50",
    status: "",
  },
  {
    id: "commission-certilys",
    label: "Commission Certilys",
    value: formatXOF(458500), // Commissions cumulées des commandes payées (modèle 40/70 selon canal)
    colorClass: "text-blue-600",
    iconBg: "bg-blue-50",
    status: "",
  },
  {
    id: "paiements-complets",
    label: "Paiements complétés",
    value: 5, // Nombre de COMPLETED
    colorClass: "text-primary",
    iconBg: "bg-primary/5",
    status: "COMPLETED",
  },
  {
    id: "acces-verifier",
    label: "Accès à vérifier",
    value: 1, // ORD-2026-0407 (COMPLETED mais access NOT_CREATED)
    colorClass: "text-amber-600",
    iconBg: "bg-amber-50",
    status: "PENDING_VERIFICATION",
  },
];

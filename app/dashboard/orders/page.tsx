"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
  Download01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Archive01Icon,
  EyeIcon,
  Alert01Icon,
  Loading02Icon,
  AlertCircleIcon,
  InboxIcon,
  SearchRemoveIcon,
  InvoiceIcon,
  LockKeyIcon,
  Money03Icon,
  Coins01Icon,
  Book01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchFilter, type FilterField } from "@/components/ui/search-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import {
  type AdminOrder,
  type OrderStatus,
  type PaymentStatus,
  type AccessStatus,
  mockOrders,
  orderStatusConfig,
  paymentStatusConfig,
  accessStatusConfig,
  formatXOF,
  formatDate,
} from "@/lib/mock/admin-orders-data";

// ─────────────────────────────────────────────────────────────────────────────
// Types actions sensibles
// ─────────────────────────────────────────────────────────────────────────────

type ActionType = "sync-payment" | "mark-review" | "revoke-access";

interface ActionDialogState {
  open: boolean;
  type: ActionType | null;
  order: AdminOrder | null;
  reason: string;
  loading: boolean;
  error: string | null;
}

const ACTION_CONFIG: Record<
  ActionType,
  {
    label: string;
    description: string;
    confirmLabel: string;
    requiresReason: boolean;
    reasonLabel: string;
    reasonPlaceholder: string;
    icon: IconSvgElement;
    variant: "default" | "destructive";
    auditEvent: "PAYMENT_SYNC_REQUESTED" | "ORDER_MARKED_FOR_REVIEW" | "ACCESS_REVOKED";
  }
> = {
  "sync-payment": {
    label: "Synchroniser le paiement Moneroo",
    description:
      "Cette action interroge la passerelle Moneroo pour mettre à jour le statut du paiement. Si le paiement est COMPLETED, l'accès apprenant sera automatiquement activé.",
    confirmLabel: "Synchroniser",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    icon: Clock01Icon,
    variant: "default",
    auditEvent: "PAYMENT_SYNC_REQUESTED",
  },
  "mark-review": {
    label: "Marquer la commande à vérifier",
    description:
      "La commande sera marquée pour examen manuel par l'équipe financière. Une alerte sera levée sur le tableau de bord.",
    confirmLabel: "Marquer à vérifier",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    icon: Alert01Icon,
    variant: "default",
    auditEvent: "ORDER_MARKED_FOR_REVIEW",
  },
  "revoke-access": {
    label: "Révoquer l'accès à la formation",
    description:
      "L'accès de l'apprenant à la formation sera immédiatement suspendu. Un motif de révocation doit être spécifié et sera communiqué à l'intéressé.",
    confirmLabel: "Révoquer l'accès",
    requiresReason: true,
    reasonLabel: "Motif de la révocation (obligatoire)",
    reasonPlaceholder: "Expliquez précisément la raison de la révocation de l'accès (min 10 caractères)…",
    icon: LockKeyIcon,
    variant: "destructive",
    auditEvent: "ACCESS_REVOKED",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Simulation API
// ─────────────────────────────────────────────────────────────────────────────

async function simulateApiCall(
  type: ActionType,
  id: string,
  reason?: string,
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 1200));

  if (Math.random() < 0.03) {
    throw new Error("Une erreur réseau est survenue. Veuillez réessayer.");
  }

  const endpointMap: Record<ActionType, string> = {
    "sync-payment": "sync-payment",
    "mark-review": "mark-for-review",
    "revoke-access": "revoke-access",
  };
  
  const endpoint = `/admin/orders/${id}/${endpointMap[type]}`;
  console.log(`[AUDIT] ${ACTION_CONFIG[type].auditEvent}`, {
    orderId: id,
    reason,
    endpoint,
    timestamp: new Date().toISOString(),
  });

  return { success: true, message: "Opération réalisée avec succès." };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Principale
// ─────────────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  // ── nuqs : état d'URL pour le statut de paiement (ex: ?paymentStatus=PENDING)
  const [paymentStatusParam, setPaymentStatusParam] = useQueryState("paymentStatus", {
    defaultValue: "",
  });

  // ── États locaux
  const [searchValue, setSearchValue] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({
    orderStatus: "",
    paymentStatus: paymentStatusParam ?? "",
    accessStatus: "",
    formation: "",
    apprenant: "",
    provider: "",
    submittedFrom: "",
    submittedTo: "",
    amountMin: "",
    amountMax: "",
  });

  // Synchronisation URL -> Filtre
  React.useEffect(() => {
    if (paymentStatusParam !== null) {
      setFilterValues((prev) => ({ ...prev, paymentStatus: paymentStatusParam }));
    }
  }, [paymentStatusParam]);

  const handleFiltersApply = React.useCallback(
    (values: Record<string, string>) => {
      setFilterValues(values);
      setPaymentStatusParam(values.paymentStatus || null);
    },
    [setPaymentStatusParam],
  );

  const handleFiltersReset = React.useCallback(() => {
    const empty = {
      orderStatus: "",
      paymentStatus: "",
      accessStatus: "",
      formation: "",
      apprenant: "",
      provider: "",
      submittedFrom: "",
      submittedTo: "",
      amountMin: "",
      amountMax: "",
    };
    setFilterValues(empty);
    setPaymentStatusParam(null);
  }, [setPaymentStatusParam]);

  // Loading initial simulé
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Dialogue d'action
  const [dialog, setDialog] = React.useState<ActionDialogState>({
    open: false,
    type: null,
    order: null,
    reason: "",
    loading: false,
    error: null,
  });

  // Données dynamiques mockées réactives aux actions locales
  const [data, setData] = React.useState<AdminOrder[]>(mockOrders);

  // ── Calcul dynamique des KPIs
  const kpis = React.useMemo(() => {
    const completedOrders = data.filter((o) => o.paymentStatus === "COMPLETED");
    const caBrut = completedOrders.reduce((sum, o) => sum + o.totalXOF, 0);
    const commission = completedOrders.reduce((sum, o) => sum + o.commissionXOF, 0);
    const completedCount = completedOrders.length;
    
    // Accès à vérifier : paiement complété mais accessStatus = NOT_CREATED
    const checkAccessCount = data.filter(
      (o) => o.paymentStatus === "COMPLETED" && o.accessStatus === "NOT_CREATED"
    ).length;

    return [
      {
        id: "ca-brut",
        label: "CA brut",
        value: formatXOF(caBrut),
        colorClass: "text-emerald-600",
        iconBg: "bg-emerald-500/10",
        icon: Money03Icon,
        filterValue: "COMPLETED",
      },
      {
        id: "commission-certilys",
        label: "Commission Certilys",
        value: formatXOF(commission),
        colorClass: "text-blue-600",
        iconBg: "bg-blue-500/10",
        icon: Coins01Icon,
        filterValue: "",
      },
      {
        id: "paiements-complets",
        label: "Paiements complétés",
        value: completedCount,
        colorClass: "text-primary",
        iconBg: "bg-primary/10",
        icon: CheckmarkCircle02Icon,
        filterValue: "COMPLETED",
      },
      {
        id: "acces-verifier",
        label: "Accès à vérifier",
        value: checkAccessCount,
        colorClass: "text-amber-600",
        iconBg: "bg-amber-500/10",
        icon: AlertCircleIcon,
        filterValue: "PENDING_VERIFICATION",
      },
    ];
  }, [data]);

  // ── Filtrage
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Recherche textuelle globale
      const q = searchValue.toLowerCase().trim();
      if (
        q &&
        !item.id.toLowerCase().includes(q) &&
        !item.apprenant.name.toLowerCase().includes(q) &&
        !item.apprenant.email.toLowerCase().includes(q) &&
        !item.formation.title.toLowerCase().includes(q)
      ) {
        return false;
      }

      // Filtre "Accès à vérifier" via KPI spécial
      if (filterValues.paymentStatus === "PENDING_VERIFICATION") {
        if (!(item.paymentStatus === "COMPLETED" && item.accessStatus === "NOT_CREATED")) {
          return false;
        }
      } else {
        // Statut Paiement standard
        if (filterValues.paymentStatus && item.paymentStatus !== filterValues.paymentStatus) {
          return false;
        }
      }

      // Statut Commande
      if (filterValues.orderStatus && item.orderStatus !== filterValues.orderStatus) {
        return false;
      }

      // Statut Accès
      if (filterValues.accessStatus && item.accessStatus !== filterValues.accessStatus) {
        return false;
      }

      // Formation (recherche partielle)
      if (
        filterValues.formation &&
        !item.formation.title.toLowerCase().includes(filterValues.formation.toLowerCase())
      ) {
        return false;
      }

      // Apprenant (recherche partielle nom/email)
      if (
        filterValues.apprenant &&
        !item.apprenant.name.toLowerCase().includes(filterValues.apprenant.toLowerCase()) &&
        !item.apprenant.email.toLowerCase().includes(filterValues.apprenant.toLowerCase())
      ) {
        return false;
      }

      // Provider
      if (filterValues.provider && item.paiement.provider !== filterValues.provider) {
        return false;
      }

      // Période de création
      if (filterValues.submittedFrom && item.createdAt) {
        if (new Date(item.createdAt) < new Date(filterValues.submittedFrom)) return false;
      }
      if (filterValues.submittedTo && item.createdAt) {
        // Ajout d'une journée pour inclure toute la journée de fin
        const dateTo = new Date(filterValues.submittedTo);
        dateTo.setDate(dateTo.getDate() + 1);
        if (new Date(item.createdAt) >= dateTo) return false;
      }

      // Montants min/max
      if (filterValues.amountMin && item.totalXOF < Number(filterValues.amountMin)) {
        return false;
      }
      if (filterValues.amountMax && item.totalXOF > Number(filterValues.amountMax)) {
        return false;
      }

      return true;
    });
  }, [data, searchValue, filterValues]);

  // Ouverture dialogue d'action
  function openAction(type: ActionType, order: AdminOrder) {
    setDialog({
      open: true,
      type,
      order,
      reason: "",
      loading: false,
      error: null,
    });
  }

  function closeDialog() {
    if (dialog.loading) return;
    setDialog((prev) => ({ ...prev, open: false }));
  }

  // Traitement d'action sensible
  async function handleConfirm() {
    if (!dialog.type || !dialog.order) return;

    setDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await simulateApiCall(dialog.type, dialog.order.id, dialog.reason);

      // Mise à jour de l'état réactif local
      setData((prevOrders) =>
        prevOrders.map((ord) => {
          if (ord.id === dialog.order!.id) {
            const updated = { ...ord, updatedAt: new Date().toISOString() };

            if (dialog.type === "revoke-access") {
              updated.accessStatus = "REVOKED";
              updated.access = {
                ...ord.access,
                revokedAt: new Date().toISOString(),
                revocationReason: dialog.reason,
              };
              updated.events = [
                {
                  title: "Accès révoqué",
                  date: new Date().toISOString(),
                  description: `Accès suspendu manuellement par l'administrateur. Motif : ${dialog.reason}`,
                },
                ...ord.events,
              ];
            } else if (dialog.type === "sync-payment") {
              // Si la commande simulait une anomalie (ex: ORD-2026-0407, paiement complet mais access non créé),
              // on synchronise en créant l'accès actif.
              if (ord.paymentStatus === "COMPLETED" && ord.accessStatus === "NOT_CREATED") {
                updated.accessStatus = "ACTIVE";
                updated.access = {
                  ...ord.access,
                  enrollmentId: `enr-${Math.floor(100000 + Math.random() * 900000)}`,
                  progressPercent: 0,
                  createdAt: new Date().toISOString(),
                };
                updated.events = [
                  {
                    title: "Accès synchronisé et activé",
                    date: new Date().toISOString(),
                    description: "Suite à la synchronisation Moneroo, l'enrôlement actif a été provisionné.",
                  },
                  ...ord.events,
                ];
              } else {
                // Autre synchronisation classique
                updated.events = [
                  {
                    title: "Paiement synchronisé",
                    date: new Date().toISOString(),
                    description: "Interrogation réussie de l'API Moneroo. Statut inchangé.",
                  },
                  ...ord.events,
                ];
              }
            } else if (dialog.type === "mark-review") {
              updated.events = [
                {
                  title: "Signalement pour vérification",
                  date: new Date().toISOString(),
                  description: "Commande marquée pour examen manuel des équipes financières.",
                },
                ...ord.events,
              ];
            }

            return updated;
          }
          return ord;
        })
      );

      setDialog((prev) => ({ ...prev, open: false, loading: false }));
    } catch (err) {
      setDialog((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Une erreur s'est produite.",
      }));
    }
  }

  // Export CSV
  function handleExportCsv() {
    const headers = [
      "ID Commande",
      "Nom Apprenant",
      "Email Apprenant",
      "Formation",
      "Montant Brut (XOF)",
      "Remise (XOF)",
      "Total Paye (XOF)",
      "Commission Certilys (XOF)",
      "Statut Paiement",
      "Statut Acces",
      "Date Creation",
    ];

    const rows = filteredData.map((o) => [
      o.id,
      o.apprenant.name,
      o.apprenant.email,
      o.formation.title,
      o.amountXOF,
      o.discountXOF,
      o.totalXOF,
      o.commissionXOF,
      paymentStatusConfig[o.paymentStatus].label,
      accessStatusConfig[o.accessStatus].label,
      o.createdAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certilys-commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Configuration des champs du composant SearchFilter
  const filters: FilterField[] = [
    {
      id: "orderStatus",
      label: "Statut Commande",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-order-status" className="w-full">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INITIATED">Initiée</SelectItem>
            <SelectItem value="PAID">Payée</SelectItem>
            <SelectItem value="CANCELLED">Annulée</SelectItem>
            <SelectItem value="EXPIRED">Expirée</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "paymentStatus",
      label: "Statut Paiement",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-payment-status" className="w-full">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">En attente (Pending)</SelectItem>
            <SelectItem value="COMPLETED">Complété (Completed)</SelectItem>
            <SelectItem value="FAILED">Échoué (Failed)</SelectItem>
            <SelectItem value="REFUNDED">Remboursé (Refunded)</SelectItem>
            <SelectItem value="PENDING_VERIFICATION">⚠️ Accès à vérifier</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "accessStatus",
      label: "Statut Accès",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-access-status" className="w-full">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="REVOKED">Révoqué</SelectItem>
            <SelectItem value="EXPIRED">Expiré</SelectItem>
            <SelectItem value="NOT_CREATED">Non créé</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "provider",
      label: "Passerelle (Provider)",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-provider" className="w-full">
            <SelectValue placeholder="Toutes les passerelles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONEROO">Moneroo</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "formation",
      label: "Titre de la Formation",
      render: (value, onChange) => (
        <input
          id="sf-filter-formation"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: Agile, OHADA, Tailwind..."
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ),
    },
    {
      id: "apprenant",
      label: "Nom ou Email de l'Apprenant",
      render: (value, onChange) => (
        <input
          id="sf-filter-apprenant"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nom, prenom ou email..."
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ),
    },
    {
      id: "submittedFrom",
      label: "Depuis le",
      render: (value, onChange) => (
        <input
          id="sf-filter-date-from"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ),
    },
    {
      id: "submittedTo",
      label: "Jusqu'au",
      render: (value, onChange) => (
        <input
          id="sf-filter-date-to"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ),
    },
    {
      id: "amountMin",
      label: "Montant minimum (XOF)",
      render: (value, onChange) => (
        <input
          id="sf-filter-amount-min"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: 50000"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ),
    },
    {
      id: "amountMax",
      label: "Montant maximum (XOF)",
      render: (value, onChange) => (
        <input
          id="sf-filter-amount-max"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: 300000"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      {/* En-tête de page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sora text-foreground">
            Commandes & paiements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivi des paiements, accès et commissions Certilys.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            id="btn-export-orders-csv"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-2"
          >
            <HugeiconsIcon icon={Download01Icon} size={16} strokeWidth={1.5} />
            Exporter CSV
          </Button>
          <Button
            id="btn-orders-to-verify"
            variant="default"
            size="sm"
            onClick={() => handleFiltersApply({ ...filterValues, paymentStatus: "PENDING" })}
            className="gap-2"
          >
            <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={1.5} />
            Paiements à vérifier
          </Button>
        </div>
      </div>

      {/* Cartes KPI compactes */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.id}
              id={`kpi-order-${kpi.id}`}
              type="button"
              onClick={() => kpi.filterValue && handleFiltersApply({ ...filterValues, paymentStatus: kpi.filterValue })}
              className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
            >
              <Card className="border-border/60 shadow-none transition-all hover:border-primary/30 hover:shadow-sm hover:-translate-y-px cursor-pointer h-full">
                <CardContent className="flex items-center gap-3 px-4 py-3 h-full">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${kpi.iconBg}`}
                  >
                    <HugeiconsIcon
                      icon={Icon}
                      className={`size-4 ${kpi.colorClass}`}
                      size={16}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold tabular-nums text-foreground leading-none">
                      {kpi.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {kpi.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Barre de recherche et de filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          placeholder="Rechercher par ID commande, apprenant, cours..."
          filters={filters}
          filterValues={filterValues}
          onFiltersApply={handleFiltersApply}
          onFiltersReset={handleFiltersReset}
          sheetTitle="Filtrer les Commandes"
          className="w-full sm:max-w-md"
        />
        {(searchValue || Object.values(filterValues).some(Boolean)) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchValue("");
              handleFiltersReset();
            }}
            className="text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto"
          >
            Effacer les filtres
          </Button>
        )}
      </div>

      {/* Tableau des commandes */}
      <Card className="border-border/60 shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table aria-label="Tableau de supervision des paiements et inscriptions Certilys">
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Commande
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Apprenant
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Formation
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    Montant
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    Commission
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Paiement
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Accès
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    Décision
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredData.length === 0 ? (
                  <EmptyState type={data.length === 0 ? "empty" : "no-results"} />
                ) : (
                  filteredData.map((order) => {
                    const payCfg = paymentStatusConfig[order.paymentStatus];
                    const accCfg = accessStatusConfig[order.accessStatus];

                    return (
                      <TableRow
                        key={order.id}
                        className="border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        {/* ID Commande */}
                        <TableCell className="px-5 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap font-medium">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="text-primary hover:underline underline-offset-2"
                            aria-label={`Dossier ${order.id}`}
                          >
                            {order.id}
                          </Link>
                        </TableCell>

                        {/* Apprenant */}
                        <TableCell className="px-4 py-3 whitespace-nowrap">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                              {order.apprenant.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px] mt-0.5">
                              {order.apprenant.email}
                            </p>
                          </div>
                        </TableCell>

                        {/* Formation */}
                        <TableCell className="px-4 py-3">
                          <p className="text-sm text-foreground font-medium truncate max-w-[200px]" title={order.formation.title}>
                            {order.formation.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                            {order.formation.instructorName}
                          </p>
                        </TableCell>

                        {/* Montant */}
                        <TableCell className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap text-right tabular-nums">
                          {formatXOF(order.totalXOF)}
                        </TableCell>

                        {/* Commission */}
                        <TableCell className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap text-right tabular-nums">
                          {formatXOF(order.commissionXOF)}
                          <span className="text-[10px] text-muted-foreground/60 block mt-0.5">({order.commissionRate}%)</span>
                        </TableCell>

                        {/* Statut Paiement */}
                        <TableCell className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`gap-1.5 px-2 py-0.5 text-[11px] font-medium ${payCfg.colorClass}`}
                          >
                            <span className={`size-1.5 rounded-full shrink-0 ${payCfg.dotClass}`} />
                            {payCfg.label}
                          </Badge>
                        </TableCell>

                        {/* Statut Accès */}
                        <TableCell className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`gap-1.5 px-2 py-0.5 text-[11px] font-medium ${accCfg.colorClass}`}
                          >
                            <span className={`size-1.5 rounded-full shrink-0 ${accCfg.dotClass}`} />
                            {accCfg.label}
                          </Badge>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>

                        {/* Actions Décisionnelles */}
                        <TableCell className="px-5 py-3 whitespace-nowrap text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                id={`action-trigger-${order.id}`}
                              >
                                <span className="sr-only">Menu actions</span>
                                <span className="font-bold text-lg leading-none -mt-1 block">···</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/orders/${order.id}`}
                                  className="cursor-pointer flex items-center justify-between"
                                >
                                  <span>Voir dossier complet</span>
                                  <HugeiconsIcon icon={EyeIcon} size={14} className="text-muted-foreground" />
                                </Link>
                              </DropdownMenuItem>

                              {/* Action synchro dispo pour les non complétés ou anomalies */}
                              {(order.paymentStatus !== "COMPLETED" || order.accessStatus === "NOT_CREATED") && (
                                <DropdownMenuItem
                                  onClick={() => openAction("sync-payment", order)}
                                  className="cursor-pointer"
                                  id={`sync-action-${order.id}`}
                                >
                                  Synchroniser Moneroo
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => openAction("mark-review", order)}
                                className="cursor-pointer"
                              >
                                Signaler pour vérification
                              </DropdownMenuItem>

                              {/* Action révocation active uniquement si accès en ligne */}
                              {order.accessStatus === "ACTIVE" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => openAction("revoke-access", order)}
                                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    id={`revoke-action-${order.id}`}
                                  >
                                    Révoquer l'accès
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modale de Dialogue des Actions Sensibles */}
      <ActionDialog
        state={dialog}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        onReasonChange={(v) => setDialog((prev) => ({ ...prev, reason: v }))}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dialogue d'Action Sensible
// ─────────────────────────────────────────────────────────────────────────────

function ActionDialog({
  state,
  onClose,
  onConfirm,
  onReasonChange,
}: {
  state: ActionDialogState;
  onClose: () => void;
  onConfirm: () => void;
  onReasonChange: (v: string) => void;
}) {
  if (!state.type || !state.order) return null;
  const cfg = ACTION_CONFIG[state.type];
  const Icon = cfg.icon;
  const needsReason = cfg.requiresReason;
  const canConfirm = !needsReason || state.reason.trim().length >= 10;

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[min(calc(100vw-2rem),46rem)] max-h-[min(760px,calc(100dvh-2rem))] overflow-hidden rounded-2xl p-0 border border-border/60">
        <div className="flex max-h-[inherit] flex-col">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4 sm:px-7 text-left">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <HugeiconsIcon
                icon={Icon}
                className={`size-4 shrink-0 ${state.type === "revoke-access" ? "text-destructive" : "text-primary"}`}
                size={16}
                strokeWidth={1.5}
              />
              {cfg.label}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {cfg.description}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 sm:px-7 sm:py-5 space-y-4">
            {/* Récapitulatif commande - Grid responsive à 3 colonnes */}
            <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] rounded-xl bg-muted/60 p-4 border border-border/40 min-w-0 overflow-hidden">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 self-start">
                <HugeiconsIcon icon={InvoiceIcon} className="size-4 text-primary" size={16} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 space-y-1">
                <span className="text-sm font-semibold text-foreground font-mono break-all block">
                  {state.order.id}
                </span>
                <p className="text-xs text-muted-foreground truncate" title={`${state.order.apprenant.name} · ${state.order.formation.title}`}>
                  {state.order.apprenant.name} · {state.order.formation.title}
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0 flex flex-col justify-between sm:items-end">
                <span className="text-sm font-bold text-foreground block tabular-nums whitespace-nowrap">
                  {formatXOF(state.order.totalXOF)}
                </span>
                <span className="font-medium text-[10px] uppercase text-muted-foreground/80">
                  {state.order.paiement.provider}
                </span>
              </div>
            </div>

            {/* Champ Motif (si requis) */}
            {needsReason && (
              <div className="space-y-2">
                <Label htmlFor="action-reason" className="text-xs font-medium text-foreground">
                  {cfg.reasonLabel}
                  <span className="ml-1 text-destructive">*</span>
                </Label>
                <Textarea
                  id="action-reason"
                  value={state.reason}
                  onChange={(e) => onReasonChange(e.target.value)}
                  placeholder={cfg.reasonPlaceholder}
                  rows={3}
                  className="resize-none text-sm focus-visible:ring-1 focus-visible:ring-ring w-full"
                  disabled={state.loading}
                />
                {state.reason.trim().length > 0 && state.reason.trim().length < 10 && (
                  <p className="text-xs text-destructive">
                    Minimum 10 caractères requis (actuellement {state.reason.trim().length}).
                  </p>
                )}
              </div>
            )}

            {/* Erreur */}
            {state.error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0" size={16} strokeWidth={1.5} />
                <span className="break-words">{state.error}</span>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 border-t bg-background px-6 py-6 sm:px-7 sm:py-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={state.loading} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button
              variant={cfg.variant}
              onClick={onConfirm}
              disabled={state.loading || !canConfirm}
              id={`btn-confirm-${state.type}`}
              className="w-full sm:w-auto"
            >
              {state.loading ? (
                <>
                  <HugeiconsIcon icon={Loading02Icon} className="size-4 animate-spin mr-2" size={16} strokeWidth={1.5} />
                  Traitement…
                </>
              ) : (
                cfg.confirmLabel
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// États Vides et Chargement
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell className="px-5 py-3">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-right">
        <Skeleton className="h-3.5 w-20 ml-auto" />
      </TableCell>
      <TableCell className="px-4 py-3 text-right">
        <Skeleton className="h-3.5 w-16 ml-auto" />
      </TableCell>
      <TableCell className="px-4 py-3">
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell className="px-4 py-3">
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="px-4 py-3">
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell className="px-5 py-3 text-right">
        <Skeleton className="h-7 w-8 ml-auto rounded" />
      </TableCell>
    </TableRow>
  );
}

function EmptyState({ type }: { type: "empty" | "no-results" }) {
  if (type === "empty") {
    return (
      <TableRow>
        <TableCell colSpan={9}>
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon icon={InboxIcon} className="size-6 text-muted-foreground" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Aucune commande</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aucune transaction n&apos;a encore été enregistrée sur le système.
              </p>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={9}>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon icon={SearchRemoveIcon} className="size-6 text-muted-foreground" size={24} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Aucun résultat</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aucune commande ne correspond aux critères de recherche sélectionnés.
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

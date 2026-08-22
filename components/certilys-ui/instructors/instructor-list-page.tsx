"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
  Download01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Rotate01Icon,
  EyeIcon,
  CheckmarkSquare01Icon,
  MessageLock01Icon,
  Cancel01Icon,
  AlertCircleIcon,
  InboxIcon,
  SearchRemoveIcon,
  Edit02Icon,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DecisionDialog } from "@/components/certilys-ui/dialogs";
import { ExpertiseDomainsDialog } from "@/components/certilys-ui/instructors/expertise-domains-dialog";
import { downloadCsvForExcel } from "@/lib/csv-export";

import {
  type InstructorApplication,
  type InstructorApplicationStatus,
  instructorStatusConfig,
  INSTRUCTOR_SPECIALTIES,
  INSTRUCTOR_COUNTRIES,
  formatDate,
} from "@/lib/mock/admin-instructors-data";
import {
  approveInstructorApplicationAction,
  getInstructorApplicationsAction,
  rejectInstructorApplicationAction,
  requestInstructorChangesAction,
} from "@/lib/admin-instructors-actions";
import {
  getAdminExpertiseDomainsAction,
  type AdminExpertiseDomain,
} from "@/lib/admin-expertise-domains-actions";

// ─────────────────────────────────────────────────────────────────────────────
// Types actions
// ─────────────────────────────────────────────────────────────────────────────

type ActionType = "approve" | "request-changes" | "reject";

interface ActionDialogState {
  open: boolean;
  type: ActionType | null;
  instructor: InstructorApplication | null;
  reason: string;
  loading: boolean;
  error: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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
    auditEvent: string;
  }
> = {
  approve: {
    label: "Approuver le formateur",
    description:
      "Le formateur sera autorisé à publier des formations sur Certilys. Cette action sera consignée dans les logs d'audit.",
    confirmLabel: "Approuver",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    icon: CheckmarkSquare01Icon,
    variant: "default",
    auditEvent: "INSTRUCTOR_APPROVED",
  },
  "request-changes": {
    label: "Demander des corrections",
    description:
      "Le formateur sera notifié et devra corriger son dossier avant un nouvel examen.",
    confirmLabel: "Envoyer la demande",
    requiresReason: true,
    reasonLabel: "Motif de la demande de correction",
    reasonPlaceholder: "Décrivez précisément les corrections attendues…",
    icon: MessageLock01Icon,
    variant: "default",
    auditEvent: "INSTRUCTOR_CHANGES_REQUESTED",
  },
  reject: {
    label: "Rejeter la candidature",
    description:
      "La candidature sera définitivement rejetée. Cette action est consignée dans les logs d'audit.",
    confirmLabel: "Rejeter",
    requiresReason: true,
    reasonLabel: "Motif du rejet (obligatoire)",
    reasonPlaceholder: "Expliquez la raison du rejet…",
    icon: Cancel01Icon,
    variant: "destructive",
    auditEvent: "INSTRUCTOR_REJECTED",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Simulation appel API
// ─────────────────────────────────────────────────────────────────────────────

async function submitInstructorDecision(
  type: ActionType,
  id: string,
  reason?: string,
): Promise<InstructorApplication> {
  if (type === "approve") {
    return approveInstructorApplicationAction(id, reason);
  }
  if (type === "reject") {
    return rejectInstructorApplicationAction(id, reason ?? "");
  }
  return requestInstructorChangesAction(id, reason ?? "");
}

function isReviewableApplication(status: InstructorApplicationStatus) {
  return status === "PENDING";
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge statut
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: InstructorApplicationStatus }) {
  const cfg = instructorStatusConfig[status];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2 py-0.5 text-xs font-medium ${cfg.colorClass}`}
    >
      <span className={`size-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
      {cfg.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar initiales
// ─────────────────────────────────────────────────────────────────────────────

function InstructorAvatar({
  instructor,
}: {
  instructor: InstructorApplication;
}) {
  return (
    <div
      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${instructor.avatarColor}`}
    >
      {instructor.initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI compacts
// ─────────────────────────────────────────────────────────────────────────────

const KPI_ICONS: Record<string, IconSvgElement> = {
  pending: Clock01Icon,
  approved: CheckmarkCircle02Icon,
  changes_requested: Rotate01Icon,
  rejected: CancelCircleIcon,
};

function InstructorKpiCards({ data }: { data: InstructorApplication[] }) {
  const instructorKpis = [
    {
      id: "pending",
      label: "En attente",
      value: data.filter((item) => item.status === "PENDING").length,
      colorClass: "text-amber-600 border-amber-500/40 bg-amber-500/10",
      iconBg: "bg-amber-500/15",
    },
    {
      id: "approved",
      label: "Approuvés",
      value: data.filter((item) => item.status === "APPROVED").length,
      colorClass: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
      iconBg: "bg-emerald-500/15",
    },
    {
      id: "changes_requested",
      label: "Corrections demandées",
      value: data.filter((item) => item.status === "CHANGES_REQUESTED").length,
      colorClass: "text-orange-600 border-orange-500/40 bg-orange-500/10",
      iconBg: "bg-orange-500/15",
    },
    {
      id: "rejected",
      label: "Rejetés",
      value: data.filter((item) => item.status === "REJECTED").length,
      colorClass: "text-red-600 border-red-500/40 bg-red-500/10",
      iconBg: "bg-red-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {instructorKpis.map((kpi) => {
        const Icon = KPI_ICONS[kpi.id];
        return (
          <Card
            key={kpi.id}
            id={`kpi-${kpi.id}`}
            className="border-border/60 shadow-none transition-colors hover:bg-muted/20 hover:border-border"
          >
              <CardContent className="flex items-center gap-3 px-4 py-3">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${kpi.iconBg}`}
                >
                  <HugeiconsIcon
                    icon={Icon}
                    className={`size-4 ${kpi.colorClass.split(" ").find((c) => c.startsWith("text-")) ?? ""}`}
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
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dialog de confirmation d'action
// ─────────────────────────────────────────────────────────────────────────────

function ActionDialog({
  state,
  onClose,
  onConfirm,
}: {
  state: ActionDialogState;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}) {
  if (!state.type || !state.instructor) return null;
  const cfg = ACTION_CONFIG[state.type];

  return (
    <DecisionDialog
      open={state.open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={cfg.label}
      description={cfg.description}
      tone={cfg.variant === "destructive" ? "danger" : state.type === "approve" ? "success" : "info"}
      profile={{
        name: state.instructor.fullName,
        email: state.instructor.email,
        initials: state.instructor.initials,
        status: state.instructor.status,
      }}
      requireReason={cfg.requiresReason}
      reasonLabel={cfg.reasonLabel}
      reasonPlaceholder={cfg.reasonPlaceholder}
      minReasonLength={10}
      confirmLabel={cfg.confirmLabel}
      cancelLabel="Annuler"
      loading={state.loading}
      error={state.error}
      onConfirm={({ reason }) => {
        onConfirm(reason);
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// États vides
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ type }: { type: "empty" | "no-results" | "error" }) {
  if (type === "error") {
    return (
      <TableRow>
        <TableCell colSpan={7}>
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="size-6 text-destructive"
                size={24}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Erreur de chargement
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Impossible de récupérer les candidatures. Veuillez rafraîchir la
                page.
              </p>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  if (type === "empty") {
    return (
      <TableRow>
        <TableCell colSpan={7}>
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon
                icon={InboxIcon}
                className="size-6 text-muted-foreground"
                size={24}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Aucune candidature
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aucun formateur n&apos;a encore soumis de dossier.
              </p>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  return (
    <TableRow>
      <TableCell colSpan={7}>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon
              icon={SearchRemoveIcon}
              className="size-6 text-muted-foreground"
              size={24}
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Aucun résultat
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aucune candidature ne correspond à vos critères de filtre.
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ligne squelette (loading)
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-7 w-24" />
      </TableCell>
    </TableRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────

export default function InstructorsPage() {
  // ── nuqs : état URL
  const [statusParam, setStatusParam] = useQueryState("status", {
    defaultValue: "",
  });

  // ── État local
  const [searchValue, setSearchValue] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<
    Record<string, string>
  >({
    status: statusParam ?? "",
    specialty: "",
    country: "",
    submittedFrom: "",
    submittedTo: "",
    isComplete: "",
  });

  // Sync paramètre URL → filtre au montage (et quand l'URL change)
  React.useEffect(() => {
    if (statusParam) {
      setFilterValues((prev) => ({ ...prev, status: statusParam }));
    }
  }, [statusParam]);

  // Sync filtre → URL
  const handleFiltersApply = React.useCallback(
    (values: Record<string, string>) => {
      setFilterValues(values);
      setStatusParam(values.status || null);
    },
    [setStatusParam],
  );

  const handleFiltersReset = React.useCallback(() => {
    const empty = {
      status: "",
      specialty: "",
      country: "",
      submittedFrom: "",
      submittedTo: "",
      isComplete: "",
    };
    setFilterValues(empty);
    setStatusParam(null);
  }, [setStatusParam]);

  // ── Loading initial
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [data, setData] = React.useState<InstructorApplication[]>([]);
  const [expertiseDomains, setExpertiseDomains] = React.useState<
    AdminExpertiseDomain[]
  >([]);
  const [expertiseDialogOpen, setExpertiseDialogOpen] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);

    getInstructorApplicationsAction()
      .then((applications) => {
        if (!active) return;
        setData(applications);
      })
      .catch(() => {
        if (!active) return;
        setLoadError(true);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    getAdminExpertiseDomainsAction()
      .then((domains) => {
        if (active) setExpertiseDomains(domains);
      })
      .catch(() => {
        // La liste reste utilisable si le catalogue est momentanément indisponible.
      });
    return () => {
      active = false;
    };
  }, []);

  // ── Dialog action
  const [dialog, setDialog] = React.useState<ActionDialogState>({
    open: false,
    type: null,
    instructor: null,
    reason: "",
    loading: false,
    error: null,
  });

  // ── Filtrage
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Recherche texte
      const q = searchValue.toLowerCase().trim();
      if (
        q &&
        !item.fullName.toLowerCase().includes(q) &&
        !item.email.toLowerCase().includes(q) &&
        !item.specialty.toLowerCase().includes(q) &&
        !item.country.toLowerCase().includes(q)
      ) {
        return false;
      }

      // Statut
      if (filterValues.status && item.status !== filterValues.status) {
        return false;
      }

      // Spécialité
      if (filterValues.specialty && item.specialty !== filterValues.specialty) {
        return false;
      }

      // Pays
      if (filterValues.country && item.country !== filterValues.country) {
        return false;
      }

      // Dossier complet
      if (filterValues.isComplete === "true" && !item.isComplete) return false;
      if (filterValues.isComplete === "false" && item.isComplete) return false;

      // Période soumission
      if (filterValues.submittedFrom && item.submittedAt) {
        if (new Date(item.submittedAt) < new Date(filterValues.submittedFrom))
          return false;
      }
      if (filterValues.submittedTo && item.submittedAt) {
        if (new Date(item.submittedAt) > new Date(filterValues.submittedTo))
          return false;
      }

      return true;
    });
  }, [data, searchValue, filterValues]);

  // ── Ouverture dialog
  function openAction(type: ActionType, instructor: InstructorApplication) {
    if (!isReviewableApplication(instructor.status)) return;

    setDialog({
      open: true,
      type,
      instructor,
      reason: "",
      loading: false,
      error: null,
    });
  }

  function closeDialog() {
    if (dialog.loading) return;
    setDialog((prev) => ({ ...prev, open: false }));
  }

  // ── Confirmation action
  async function handleConfirm(reasonOverride?: string) {
    if (!dialog.type || !dialog.instructor) return;
    const reason = reasonOverride ?? dialog.reason;

    setDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const updated = await submitInstructorDecision(
        dialog.type,
        dialog.instructor.id,
        reason,
      );

      setData((prev) =>
        prev.map((item) =>
          item.id === dialog.instructor!.id ? updated : item,
        ),
      );

      setDialog((prev) => ({ ...prev, open: false, loading: false }));
    } catch (err) {
      setDialog((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Une erreur est survenue.",
      }));
    }
  }

  // ── Export CSV (simulé)
  function handleExportCsv() {
    const headers = [
      "ID",
      "Nom",
      "Email",
      "Spécialité",
      "Pays",
      "Statut",
      "Date soumission",
      "Formations soumises",
      "Dossier complet",
    ];
    const rows = filteredData.map((item) => [
      item.id,
      item.fullName,
      item.email,
      item.specialty,
      item.country,
      instructorStatusConfig[item.status].label,
      formatDate(item.submittedAt),
      item.coursesSubmitted,
      item.isComplete ? "Oui" : "Non",
    ]);

    downloadCsvForExcel(
      `certilys-formateurs-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    );
  }

  // ── Filtres SearchFilter
  const filters: FilterField[] = [
    {
      id: "status",
      label: "Statut",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-status" className="w-full">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="APPROVED">Approuvé</SelectItem>
            <SelectItem value="CHANGES_REQUESTED">
              Corrections demandées
            </SelectItem>
            <SelectItem value="REJECTED">Rejeté</SelectItem>
            <SelectItem value="NOT_SUBMITTED">Non soumis</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "specialty",
      label: "Spécialité principale",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-specialty" className="w-full">
            <SelectValue placeholder="Toutes les spécialités" />
          </SelectTrigger>
          <SelectContent>
            {(expertiseDomains.length > 0
              ? expertiseDomains.map((domain) => domain.name)
              : INSTRUCTOR_SPECIALTIES
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "country",
      label: "Pays",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-country" className="w-full">
            <SelectValue placeholder="Tous les pays" />
          </SelectTrigger>
          <SelectContent>
            {INSTRUCTOR_COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "submittedFrom",
      label: "Soumis depuis",
      render: (value, onChange) => (
        <input
          id="sf-filter-submittedFrom"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ),
    },
    {
      id: "submittedTo",
      label: "Soumis jusqu'au",
      render: (value, onChange) => (
        <input
          id="sf-filter-submittedTo"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ),
    },
    {
      id: "isComplete",
      label: "Dossier complet",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-isComplete" className="w-full">
            <SelectValue placeholder="Tous les dossiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Oui — Dossier complet</SelectItem>
            <SelectItem value="false">Non — Dossier incomplet</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  // ── Nombre de filtres actifs (hors recherche)
  const activeFilterCount = Object.values(filterValues).filter(Boolean).length;

  const hasData = data.length > 0;
  const hasResults = filteredData.length > 0;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      {/* ── 1. Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-sora">
            Formateurs
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Validation et suivi des profils formateurs Certilys.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            id="btn-manage-expertise-domains"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setExpertiseDialogOpen(true)}
          >
            <HugeiconsIcon
              icon={Edit02Icon}
              className="size-4"
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Domaines d’expertise</span>
          </Button>

          <Button
            id="btn-export-csv"
            variant="outline"
            size="sm"
            className="gap-2 border-border text-foreground hover:bg-muted"
            onClick={handleExportCsv}
            aria-label="Exporter les candidatures au format CSV"
          >
            <HugeiconsIcon
              icon={Download01Icon}
              className="size-4"
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Exporter CSV</span>
          </Button>

          <Button id="btn-dossiers-attente" asChild size="sm" className="gap-2">
            <Link
              href="/dashboard/instructors?status=PENDING"
              aria-label="Voir les dossiers formateurs en attente de validation"
              onClick={() => {
                setStatusParam("PENDING");
                setFilterValues((prev) => ({ ...prev, status: "PENDING" }));
              }}
            >
              <HugeiconsIcon
                icon={Clock01Icon}
                className="size-4"
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>Dossiers en attente</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 2. KPI compacts ────────────────────────────────────────────────── */}
      <InstructorKpiCards data={data} />

      {/* ── 3. Recherche + filtres ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <SearchFilter
          placeholder="Rechercher un formateur, spécialité, pays…"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filters}
          filterValues={filterValues}
          onFiltersApply={handleFiltersApply}
          onFiltersReset={handleFiltersReset}
          sheetTitle="Filtrer les formateurs"
          className="w-full max-w-sm"
        />
        {activeFilterCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {filteredData.length} résultat
            {filteredData.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── 4. Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="min-w-[200px]">Formateur</TableHead>
              <TableHead className="min-w-[160px]">Spécialité</TableHead>
              <TableHead className="min-w-[120px]">Pays</TableHead>
              <TableHead className="min-w-[160px]">Statut</TableHead>
              <TableHead className="min-w-[140px]">
                Date de soumission
              </TableHead>
              <TableHead className="min-w-[80px] text-center">
                Formations soumises
              </TableHead>
              <TableHead className="min-w-[160px] text-right">
                Décision
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading */}
            {loading &&
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {/* Données chargées */}
            {!loading && loadError && <EmptyState type="error" />}
            {!loading && !loadError && !hasData && <EmptyState type="empty" />}
            {!loading && !loadError && hasData && !hasResults && (
              <EmptyState type="no-results" />
            )}

            {!loading &&
              !loadError &&
              hasResults &&
              filteredData.map((instructor) => {
                const canDecide = isReviewableApplication(instructor.status);

                return (
                  <TableRow
                    key={instructor.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                  {/* Formateur */}
                  <TableCell>
                    <Link
                      href={`/dashboard/instructors/${instructor.id}`}
                      id={`instructor-row-${instructor.id}`}
                      className="flex items-center gap-2.5 min-w-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
                    >
                      <InstructorAvatar instructor={instructor} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {instructor.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {instructor.email}
                        </p>
                      </div>
                    </Link>
                  </TableCell>

                  {/* Spécialité */}
                  <TableCell className="text-sm text-foreground">
                    {instructor.specialty}
                  </TableCell>

                  {/* Pays */}
                  <TableCell className="text-sm text-foreground">
                    {instructor.country}
                  </TableCell>

                  {/* Statut */}
                  <TableCell>
                    <StatusBadge status={instructor.status} />
                  </TableCell>

                  {/* Date soumission */}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(instructor.submittedAt)}
                  </TableCell>

                  {/* Formations soumises */}
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-foreground">
                      {instructor.coursesSubmitted}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Voir dossier */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link
                          href={`/dashboard/instructors/${instructor.id}`}
                          id={`btn-view-${instructor.id}`}
                          aria-label={`Voir le dossier de ${instructor.fullName}`}
                        >
                          <HugeiconsIcon
                            icon={EyeIcon}
                            className="size-3.5"
                            size={14}
                            strokeWidth={1.5}
                          />
                          Dossier
                        </Link>
                      </Button>

                      {/* Menu actions */}
                      {canDecide ? (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                            aria-label={`Actions pour ${instructor.fullName}`}
                            id={`btn-actions-${instructor.id}`}
                          >
                            Décider
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            onClick={() => openAction("approve", instructor)}
                            className="gap-2"
                          >
                            <HugeiconsIcon
                              icon={CheckmarkSquare01Icon}
                              className="size-4 text-emerald-500"
                              size={16}
                              strokeWidth={1.5}
                            />
                            Approuver
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              openAction("request-changes", instructor)
                            }
                            className="gap-2"
                          >
                            <HugeiconsIcon
                              icon={MessageLock01Icon}
                              className="size-4 text-amber-500"
                              size={16}
                              strokeWidth={1.5}
                            />
                            Demander corrections
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openAction("reject", instructor)}
                            variant="destructive"
                            className="gap-2"
                          >
                            <HugeiconsIcon
                              icon={Cancel01Icon}
                              className="size-4"
                              size={16}
                              strokeWidth={1.5}
                            />
                            Rejeter
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                          disabled
                        >
                          Décision prise
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )})}
          </TableBody>
        </Table>
      </div>

      {/* ── Dialog confirmation ──────────────────────────────────────────────── */}
      <ActionDialog
        state={dialog}
        onClose={closeDialog}
        onConfirm={handleConfirm}
      />

      <ExpertiseDomainsDialog
        open={expertiseDialogOpen}
        onOpenChange={setExpertiseDialogOpen}
        onDomainsChange={setExpertiseDomains}
      />
    </div>
  );
}

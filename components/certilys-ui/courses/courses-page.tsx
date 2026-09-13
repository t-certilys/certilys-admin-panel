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
  CheckmarkSquare01Icon,
  MessageLock01Icon,
  Cancel01Icon,
  AlertCircleIcon,
  InboxIcon,
  SearchRemoveIcon,
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
import { REVIEW_REASON_MIN_LENGTH } from "@/lib/courses/course-review-decision.schema";
import { downloadCsvForExcel } from "@/lib/csv-export";
import {
  approveAdminCourseAction,
  getAdminCoursesAction,
  rejectAdminCourseAction,
  requestAdminCourseChangesAction,
} from "@/lib/admin-courses-actions";

import {
  type AdminCourseSubmission,
  type CourseSubmissionStatus,
  courseStatusConfig,
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  formatDate,
  formatPrice,
} from "@/lib/mock/admin-courses-data";

// ─────────────────────────────────────────────────────────────────────────────
// Types actions
// ─────────────────────────────────────────────────────────────────────────────

type ActionType = "approve" | "request-changes" | "reject";

interface ActionDialogState {
  open: boolean;
  type: ActionType | null;
  course: AdminCourseSubmission | null;
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
    label: "Approuver la formation",
    description:
      "La formation sera mise en ligne immédiatement : elle apparaîtra au catalogue et pourra être achetée. Cette action sera consignée dans les logs d'audit.",
    confirmLabel: "Approuver",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    icon: CheckmarkSquare01Icon,
    variant: "default",
    auditEvent: "COURSE_APPROVED",
  },
  "request-changes": {
    label: "Demander des corrections",
    description:
      "Le formateur sera notifié et devra corriger la formation avant un nouvel examen.",
    confirmLabel: "Envoyer la demande",
    requiresReason: true,
    reasonLabel: "Motif de la demande de correction",
    reasonPlaceholder: "Décrivez précisément les corrections attendues…",
    icon: MessageLock01Icon,
    variant: "default",
    auditEvent: "COURSE_CHANGES_REQUESTED",
  },
  reject: {
    label: "Rejeter la formation",
    description:
      "La formation sera rejetée. Cette action est consignée dans les logs d'audit.",
    confirmLabel: "Rejeter",
    requiresReason: true,
    reasonLabel: "Motif du rejet (obligatoire)",
    reasonPlaceholder: "Expliquez la raison du rejet…",
    icon: Cancel01Icon,
    variant: "destructive",
    auditEvent: "COURSE_REJECTED",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Simulation API
// ─────────────────────────────────────────────────────────────────────────────

async function applyCourseDecision(
  type: ActionType,
  id: string,
  reason?: string,
): Promise<AdminCourseSubmission> {
  if (type === "approve") {
    return approveAdminCourseAction(id, reason);
  }
  const payload = { reason: reason?.trim() ?? "", items: [] };
  if (type === "request-changes") {
    return requestAdminCourseChangesAction(id, payload);
  }
  return rejectAdminCourseAction(id, payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge statut
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CourseSubmissionStatus }) {
  const cfg = courseStatusConfig[status];
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

/** Une formation attend une décision : première soumission ou mise à jour. */
function isAwaitingReview(course: AdminCourseSubmission) {
  return course.status === "SUBMITTED" || Boolean(course.pendingRevisionSubmittedAt);
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI compacts
// ─────────────────────────────────────────────────────────────────────────────

const KPI_ICONS: Record<string, IconSvgElement> = {
  submitted: Clock01Icon,
  approved: CheckmarkCircle02Icon,
  rejected: CancelCircleIcon,
  archived: Archive01Icon,
};

function CourseKpiCards({ data }: { data: AdminCourseSubmission[] }) {
  const kpis = [
    {
      id: "submitted",
      label: "Soumises",
      value: data.filter(isAwaitingReview).length,
      colorClass: "text-amber-600 border-amber-500/40 bg-amber-500/10",
      iconBg: "bg-amber-500/15",
    },
    {
      id: "approved",
      label: "Approuvées",
      value: data.filter(
        (course) =>
          course.status === "APPROVED" || course.status === "PUBLISHED",
      ).length,
      colorClass: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
      iconBg: "bg-emerald-500/15",
    },
    {
      id: "rejected",
      label: "Rejetées / Corrections",
      value: data.filter(
        (course) =>
          course.status === "REJECTED" ||
          course.status === "CHANGES_REQUESTED",
      ).length,
      colorClass: "text-red-600 border-red-500/40 bg-red-500/10",
      iconBg: "bg-red-500/15",
    },
    {
      id: "archived",
      label: "Archivées",
      value: data.filter((course) => course.status === "ARCHIVED").length,
      colorClass: "text-slate-500 border-slate-400/40 bg-slate-400/10",
      iconBg: "bg-slate-400/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = KPI_ICONS[kpi.id];
        return (
          <Card
            key={kpi.id}
            id={`kpi-course-${kpi.id}`}
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
// Dialog confirmation
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
  if (!state.type || !state.course) return null;
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
        name: state.course.title,
        email: `${state.course.instructorName} · ${state.course.category}`,
        initials: state.course.title.slice(0, 2).toUpperCase(),
        status: state.course.status,
      }}
      requireReason={cfg.requiresReason}
      reasonLabel={cfg.reasonLabel}
      reasonPlaceholder={cfg.reasonPlaceholder}
      minReasonLength={REVIEW_REASON_MIN_LENGTH}
      confirmLabel={cfg.confirmLabel}
      cancelLabel="Annuler"
      loading={state.loading}
      error={state.error}
      onConfirm={({ reason }) => onConfirm(reason)}
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
        <TableCell colSpan={8}>
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
                Impossible de récupérer les soumissions. Veuillez rafraîchir la
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
        <TableCell colSpan={8}>
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
                Aucune formation
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aucune formation n&apos;a encore été soumise.
              </p>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  return (
    <TableRow>
      <TableCell colSpan={8}>
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
              Aucune formation ne correspond à vos critères de filtre.
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
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="h-3 w-28" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
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

export default function CoursesPage() {
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
    category: "",
    level: "",
    instructor: "",
    submittedFrom: "",
    submittedTo: "",
    priceMin: "",
    priceMax: "",
  });

  // Sync URL → filtre au montage
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
      category: "",
      level: "",
      instructor: "",
      submittedFrom: "",
      submittedTo: "",
      priceMin: "",
      priceMax: "",
    };
    setFilterValues(empty);
    setStatusParam(null);
  }, [setStatusParam]);

  // ── Loading initial simulé
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [data, setData] = React.useState<AdminCourseSubmission[]>([]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadError(false);

    getAdminCoursesAction()
      .then((courses) => {
        if (!mounted) return;
        setData(courses);
      })
      .catch(() => {
        if (!mounted) return;
        setData([]);
        setLoadError(true);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ── Dialog action
  const [dialog, setDialog] = React.useState<ActionDialogState>({
    open: false,
    type: null,
    course: null,
    reason: "",
    loading: false,
    error: null,
  });

  // ── Data locale
  // ── Filtrage
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Recherche texte
      const q = searchValue.toLowerCase().trim();
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.instructorName.toLowerCase().includes(q) &&
        !item.category.toLowerCase().includes(q) &&
        !item.slug.toLowerCase().includes(q)
      ) {
        return false;
      }

      // Statut. « Soumise » inclut les mises à jour de formations en ligne,
      // qui attendent elles aussi une décision.
      if (
        filterValues.status &&
        item.status !== filterValues.status &&
        !(filterValues.status === "SUBMITTED" && isAwaitingReview(item))
      ) {
        return false;
      }

      // Catégorie
      if (filterValues.category && item.category !== filterValues.category) {
        return false;
      }

      // Niveau
      if (filterValues.level && item.level !== filterValues.level) {
        return false;
      }

      // Formateur (recherche partielle)
      if (
        filterValues.instructor &&
        !item.instructorName
          .toLowerCase()
          .includes(filterValues.instructor.toLowerCase())
      ) {
        return false;
      }

      // Période soumission
      if (filterValues.submittedFrom && item.submittedAt) {
        if (new Date(item.submittedAt) < new Date(filterValues.submittedFrom))
          return false;
      }
      if (filterValues.submittedTo && item.submittedAt) {
        if (new Date(item.submittedAt) > new Date(filterValues.submittedTo))
          return false;
      }

      // Prix min
      if (filterValues.priceMin && item.price < Number(filterValues.priceMin)) {
        return false;
      }

      // Prix max
      if (filterValues.priceMax && item.price > Number(filterValues.priceMax)) {
        return false;
      }

      return true;
    });
  }, [data, searchValue, filterValues]);

  // ── Ouverture dialog
  function openAction(type: ActionType, course: AdminCourseSubmission) {
    if (course.status !== "SUBMITTED") return;
    setDialog({
      open: true,
      type,
      course,
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
    if (!dialog.type || !dialog.course) return;
    const reason = reasonOverride ?? dialog.reason;

    setDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const updatedCourse = await applyCourseDecision(
        dialog.type,
        dialog.course.id,
        reason,
      );

      setData((prev) =>
        prev.map((item) =>
          item.id === dialog.course!.id ? updatedCourse : item,
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
      "Titre",
      "Formateur",
      "Catégorie",
      "Niveau",
      "Prix",
      "Statut",
      "Date soumission",
    ];
    const rows = filteredData.map((item) => [
      item.id,
      item.title,
      item.instructorName,
      item.category,
      item.level,
      `${item.price} ${item.currency}`,
      courseStatusConfig[item.status].label,
      formatDate(item.submittedAt),
    ]);

    downloadCsvForExcel(
      `certilys-formations-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    );
  }

  // ── Filtres SearchFilter
  const inputDateClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  const filters: FilterField[] = [
    {
      id: "status",
      label: "Statut",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-status-course" className="w-full">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="SUBMITTED">Soumise</SelectItem>
            <SelectItem value="APPROVED">Approuvée</SelectItem>
            <SelectItem value="CHANGES_REQUESTED">
              Corrections demandées
            </SelectItem>
            <SelectItem value="REJECTED">Rejetée</SelectItem>
            <SelectItem value="PUBLISHED">Publiée</SelectItem>
            <SelectItem value="ARCHIVED">Archivée</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "category",
      label: "Catégorie",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-category" className="w-full">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            {COURSE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "level",
      label: "Niveau",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-level" className="w-full">
            <SelectValue placeholder="Tous les niveaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BEGINNER">Débutant</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
            <SelectItem value="ADVANCED">Avancé</SelectItem>
            <SelectItem value="ALL_LEVELS">Tous niveaux</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "instructor",
      label: "Formateur",
      render: (value, onChange) => (
        <input
          id="sf-filter-instructor"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nom du formateur…"
          className={inputDateClass}
        />
      ),
    },
    {
      id: "submittedFrom",
      label: "Soumis depuis",
      render: (value, onChange) => (
        <input
          id="sf-filter-submittedFrom-course"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputDateClass}
        />
      ),
    },
    {
      id: "submittedTo",
      label: "Soumis jusqu'au",
      render: (value, onChange) => (
        <input
          id="sf-filter-submittedTo-course"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputDateClass}
        />
      ),
    },
    {
      id: "priceMin",
      label: "Prix minimum",
      render: (value, onChange) => (
        <input
          id="sf-filter-priceMin"
          type="number"
          min="0"
          step="1000"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={inputDateClass}
        />
      ),
    },
    {
      id: "priceMax",
      label: "Prix maximum",
      render: (value, onChange) => (
        <input
          id="sf-filter-priceMax"
          type="number"
          min="0"
          step="1000"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="100000"
          className={inputDateClass}
        />
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
            Formations
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Validation des formations soumises avant publication.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            id="btn-export-csv-courses"
            variant="outline"
            size="sm"
            className="gap-2 border-border text-foreground hover:bg-muted"
            onClick={handleExportCsv}
            aria-label="Exporter les formations au format CSV"
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

          <Button
            id="btn-formations-soumises"
            asChild
            size="sm"
            className="gap-2"
          >
            <Link
              href="/dashboard/courses?status=SUBMITTED"
              aria-label="Voir les formations en attente de validation"
              onClick={() => {
                setStatusParam("SUBMITTED");
                setFilterValues((prev) => ({ ...prev, status: "SUBMITTED" }));
              }}
            >
              <HugeiconsIcon
                icon={Clock01Icon}
                className="size-4"
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>Formations soumises</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 2. KPI compacts ────────────────────────────────────────────────── */}
      <CourseKpiCards data={data} />

      {/* ── 3. Recherche + filtres ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <SearchFilter
          placeholder="Rechercher une formation, formateur, catégorie…"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filters}
          filterValues={filterValues}
          onFiltersApply={handleFiltersApply}
          onFiltersReset={handleFiltersReset}
          sheetTitle="Filtrer les formations"
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
              <TableHead className="min-w-[220px]">Formation</TableHead>
              <TableHead className="min-w-[140px]">Formateur</TableHead>
              <TableHead className="min-w-[140px]">Catégorie</TableHead>
              <TableHead className="min-w-[110px]">Niveau</TableHead>
              <TableHead className="min-w-[100px]">Prix</TableHead>
              <TableHead className="min-w-[130px]">Statut</TableHead>
              <TableHead className="min-w-[140px]">Date soumission</TableHead>
              <TableHead className="min-w-[180px] text-right">
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
              hasResults &&
              filteredData.map((course) => (
                <TableRow
                  key={course.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  {/* Formation */}
                  <TableCell>
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      id={`course-row-${course.id}`}
                      className="block min-w-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
                    >
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                        {course.slug}
                      </p>
                    </Link>
                  </TableCell>

                  {/* Formateur */}
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${course.instructorAvatarColor}`}
                      >
                        {course.instructorInitials}
                      </div>
                      <span className="text-sm text-foreground truncate">
                        {course.instructorName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Catégorie */}
                  <TableCell className="text-sm text-foreground">
                    {course.category}
                  </TableCell>

                  {/* Niveau */}
                  <TableCell className="text-sm text-foreground">
                    {COURSE_LEVELS[course.level]}
                  </TableCell>

                  {/* Prix */}
                  <TableCell className="text-sm text-foreground tabular-nums">
                    {formatPrice(course.price, course.currency)}
                    {course.promoPrice && (
                      <span className="block text-xs text-emerald-600 tabular-nums">
                        Promo: {formatPrice(course.promoPrice, course.currency)}
                      </span>
                    )}
                  </TableCell>

                  {/* Statut */}
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge status={course.status} />
                      {course.pendingRevisionSubmittedAt ? (
                        <Link
                          href={`/dashboard/courses/${course.id}`}
                          className="rounded"
                        >
                          <Badge
                            variant="outline"
                            className="gap-1.5 border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 hover:bg-amber-500/20"
                          >
                            <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                            Mise à jour à valider
                          </Badge>
                        </Link>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* Date soumission */}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(
                      course.pendingRevisionSubmittedAt ?? course.submittedAt,
                    )}
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
                          href={`/dashboard/courses/${course.id}`}
                          id={`btn-view-course-${course.id}`}
                          aria-label={`Voir le dossier de ${course.title}`}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                            aria-label={`Actions pour ${course.title}`}
                            id={`btn-actions-course-${course.id}`}
                            disabled={course.status !== "SUBMITTED"}
                          >
                            Décider
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            onClick={() => openAction("approve", course)}
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
                            onClick={() => openAction("request-changes", course)}
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
                            onClick={() => openAction("reject", course)}
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Dialog confirmation ─────────────────────────────────────────────── */}
      <ActionDialog
        state={dialog}
        onClose={closeDialog}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import {
  Shield01Icon,
  Download01Icon,
  SearchRemoveIcon,
  InboxIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  AlertCircleIcon,
  UserIcon,
  EyeIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFilter, type FilterField } from "@/components/ui/search-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getAdminAuditLogsAction,
  type AdminAuditLog,
  type AuditKpis,
} from "@/lib/admin-audit-actions";
import { AppDialog } from "@/components/certilys-ui/dialogs";
import { downloadCsvForExcel } from "@/lib/csv-export";

// ─────────────────────────────────────────────────────────────────────────────
// Configurations et Dictionnaires
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_TRANSLATIONS: Record<string, { label: string; color: string }> = {
  INSTRUCTOR_APPROVED: {
    label: "Formateur approuvé",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  },
  INSTRUCTOR_REJECTED: {
    label: "Formateur rejeté",
    color: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  },
  INSTRUCTOR_CHANGES_REQUESTED: {
    label: "Modifications formateur requises",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  },
  COURSE_APPROVED: {
    label: "Formation approuvée",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  },
  COURSE_REJECTED: {
    label: "Formation rejetée",
    color: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  },
  COURSE_CHANGES_REQUESTED: {
    label: "Modifications formation requises",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  },
  ACCESS_REVOKED: {
    label: "Accès révoqué",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
  },
  USER_SUSPENDED: {
    label: "Compte suspendu",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
  },
  USER_REACTIVATED: {
    label: "Compte réactivé",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400",
  },
  TWO_FACTOR_DISABLED_BY_ADMIN: {
    label: "2FA désactivée par admin",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400",
  },
  ORDER_MARKED_FOR_REVIEW: {
    label: "Commande marquée pour examen",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  },
  PAYMENT_SYNC_REQUESTED: {
    label: "Synchronisation paiement demandée",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
  },
};

const SEVERITY_TRANSLATIONS: Record<
  AdminAuditLog["severity"],
  { label: string; color: string; dot: string }
> = {
  info: {
    label: "Info",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  warning: {
    label: "Avertissement",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  critical: {
    label: "Critique",
    color: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    dot: "bg-red-500",
  },
};

const TARGET_TYPE_TRANSLATIONS: Record<string, string> = {
  INSTRUCTOR: "Formateur",
  COURSE: "Formation",
  USER: "Utilisateur",
  ORDER: "Commande",
  SYSTEM: "Système",
};

// ─────────────────────────────────────────────────────────────────────────────
function getAuditKpis(logs: AdminAuditLog[]): AuditKpis {
  return {
    totalCount: logs.length,
    todayCount: logs.filter((log) => isSameDay(new Date(log.createdAt), new Date())).length,
    criticalCount: logs.filter((log) => log.severity === "critical").length,
    revocationsCount: logs.filter((log) =>
      ["ACCESS_REVOKED", "USER_SUSPENDED"].includes(log.action),
    ).length,
  };
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function isWithinLastDays(value: Date, days: number) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return value >= threshold;
}

function formatAuditDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function AuditLogsPage() {
  // ── États locaux
  const [searchValue, setSearchValue] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({
    action: "",
    admin: "",
    targetType: "",
    period: "",
    severity: "",
  });

  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<AdminAuditLog[]>([]);
  const [selectedLog, setSelectedLog] = React.useState<AdminAuditLog | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadAuditLogs() {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await getAdminAuditLogsAction();
        if (cancelled) return;
        setData(response.logs);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les journaux d’audit.",
        );
        setData([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAuditLogs();

    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = React.useMemo(() => getAuditKpis(data), [data]);

  // Liste unique des administrateurs présents pour le filtre
  const adminNames = React.useMemo(() => {
    const names = new Set(data.map((log) => log.adminName));
    return Array.from(names).sort();
  }, [data]);

  // Filtrage logique des journaux d’audit
  const filteredLogs = React.useMemo(() => {
    return data.filter((log) => {
      // 1. Recherche globale
      const q = searchValue.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          log.adminName.toLowerCase().includes(q) ||
          log.targetLabel.toLowerCase().includes(q) ||
          log.targetId.toLowerCase().includes(q) ||
          (log.reason && log.reason.toLowerCase().includes(q)) ||
          log.id.toLowerCase().includes(q);

        if (!matchesSearch) return false;
      }

      // 2. Filtre par action
      if (filterValues.action && log.action !== filterValues.action) return false;

      // 3. Filtre par administrateur
      if (filterValues.admin && log.adminName !== filterValues.admin) return false;

      // 4. Filtre par type de cible
      if (filterValues.targetType && log.targetType !== filterValues.targetType) return false;

      if (filterValues.severity && log.severity !== filterValues.severity) return false;

      if (filterValues.period) {
        const createdAt = new Date(log.createdAt);
        const isToday = isSameDay(createdAt, new Date());
        const isSevenDays = isWithinLastDays(createdAt, 7);

        if (filterValues.period === "today" && !isToday) return false;
        if (filterValues.period === "7days" && !isSevenDays) return false;
        if (filterValues.period === "older" && isSevenDays) return false;
      }

      return true;
    });
  }, [data, searchValue, filterValues]);

  // Nombre de filtres actuellement actifs (hors recherche)
  const activeFilterCount = React.useMemo(() => {
    return Object.values(filterValues).filter((v) => v !== "").length;
  }, [filterValues]);

  // Fonction d'exportation CSV complète et fonctionnelle
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Date_Heure",
      "Action",
      "Admin",
      "Role_Admin",
      "Type_Cible",
      "ID_Cible",
      "Label_Cible",
      "Criticite",
      "Motif",
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      formatAuditDate(log.createdAt),
      ACTION_TRANSLATIONS[log.action]?.label || log.action,
      log.adminName,
      log.adminRole,
      TARGET_TYPE_TRANSLATIONS[log.targetType] || log.targetType,
      log.targetId,
      log.targetLabel,
      SEVERITY_TRANSLATIONS[log.severity]?.label || log.severity,
      log.reason || "",
    ]);

    downloadCsvForExcel(
      `audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
      headers,
      rows,
    );
  };

  // Définition des filtres pour SearchFilter
  const filterFields: FilterField[] = [
    {
      id: "action",
      label: "Action",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-action" className="w-full">
            <SelectValue placeholder="Toutes les actions" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ACTION_TRANSLATIONS).map(([key, item]) => (
              <SelectItem key={key} value={key}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "admin",
      label: "Administrateur",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-admin" className="w-full">
            <SelectValue placeholder="Tous les admins" />
          </SelectTrigger>
          <SelectContent>
            {adminNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "targetType",
      label: "Type de cible",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-target" className="w-full">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TARGET_TYPE_TRANSLATIONS).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "period",
      label: "Période",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-period" className="w-full">
            <SelectValue placeholder="Toutes les périodes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Aujourd’hui</SelectItem>
            <SelectItem value="7days">7 derniers jours</SelectItem>
            <SelectItem value="older">Plus anciens</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "severity",
      label: "Criticité",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-severity" className="w-full">
            <SelectValue placeholder="Toutes les criticités" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SEVERITY_TRANSLATIONS).map(([key, item]) => (
              <SelectItem key={key} value={key}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* ── 1. En-tête de la page ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Logs / Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Traçabilité des décisions sensibles du back-office Certilys.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="gap-2 font-medium"
          >
            <HugeiconsIcon icon={Download01Icon} className="size-4" size={16} strokeWidth={1.5} />
            <span>Exporter CSV</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Indicateurs KPI compacts ───────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 : Total */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={Shield01Icon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.totalCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Total des actions</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 : Aujourd’hui */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-4"
                size={16}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.todayCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Aujourd’hui</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 : Actions Critiques */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.criticalCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Actions critiques</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 : Révocations / Suspensions */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.revocationsCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Révocations / Suspensions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Recherche et Entonnoir de Filtrage ─────────────────────────── */}
      <div className="flex items-center gap-3">
        <SearchFilter
          placeholder="Rechercher par cible, admin, motif ou ID…"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filterFields}
          filterValues={filterValues}
          onFiltersApply={setFilterValues}
          onFiltersReset={() =>
            setFilterValues({ action: "", admin: "", targetType: "", period: "", severity: "" })
          }
          sheetTitle="Filtrer les journaux d’audit"
          className="w-full max-w-sm"
        />
        {activeFilterCount > 0 && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {filteredLogs.length} log{filteredLogs.length > 1 ? "s" : ""} trouvé
            {filteredLogs.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── 4. Table des Logs d'Audit ─────────────────────────────────────── */}
      {loadError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {loadError}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="min-w-[140px]">Date & Heure</TableHead>
              <TableHead className="min-w-[200px]">Action</TableHead>
              <TableHead className="min-w-[160px]">Administrateur</TableHead>
              <TableHead className="min-w-[160px]">Cible</TableHead>
              <TableHead className="min-w-[240px]">Résumé / Motif</TableHead>
              <TableHead className="min-w-[110px]">Criticité</TableHead>
              <TableHead className="min-w-[80px] text-right">Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-44 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-52" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <HugeiconsIcon
                      icon={searchValue || activeFilterCount > 0 ? SearchRemoveIcon : InboxIcon}
                      className="size-8 text-muted-foreground/50"
                      size={32}
                    />
                    <p className="text-sm font-medium">Aucun journal d’audit trouvé</p>
                    <p className="text-xs text-muted-foreground/80">
                      Essayez d’ajuster ou de réinitialiser vos filtres.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const actionCfg = ACTION_TRANSLATIONS[log.action];
                const severityCfg = SEVERITY_TRANSLATIONS[log.severity];
                return (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    {/* Colonne Date & Heure */}
                    <TableCell className="font-medium text-foreground whitespace-nowrap">
                      {formatAuditDate(log.createdAt)}
                    </TableCell>

                    {/* Colonne Action */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`px-2 py-0.5 text-xs font-semibold tracking-wide ${actionCfg?.color}`}
                      >
                        {actionCfg?.label || log.action}
                      </Badge>
                    </TableCell>

                    {/* Colonne Administrateur */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {log.adminName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {log.adminRole}
                        </span>
                      </div>
                    </TableCell>

                    {/* Colonne Cible */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-muted-foreground leading-none">
                          {TARGET_TYPE_TRANSLATIONS[log.targetType] || log.targetType}
                        </span>
                        <span className="text-xs text-foreground font-medium mt-1 truncate max-w-[150px]">
                          {log.targetLabel}
                        </span>
                      </div>
                    </TableCell>

                    {/* Colonne Résumé/Motif */}
                    <TableCell>
                      <p className="text-xs text-muted-foreground max-w-[240px] truncate">
                        {log.reason || "Aucun motif spécifié"}
                      </p>
                    </TableCell>

                    {/* Colonne Criticité */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`gap-1.5 px-2 py-0.5 text-xs font-medium ${severityCfg?.color}`}
                      >
                        <span className={`size-1.5 rounded-full ${severityCfg?.dot}`} />
                        {severityCfg?.label || log.severity}
                      </Badge>
                    </TableCell>

                    {/* Colonne Actions */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                        title="Voir les détails"
                      >
                        <HugeiconsIcon icon={EyeIcon} className="size-4 text-foreground" size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── 5. Dialogue de Détails du Log (Lecture Seule) ───────────────── */}
      <AppDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        size="lg"
        title="Détail du journal d’audit"
        description={selectedLog ? `ID: ${selectedLog.id}` : undefined}
        footer={
          <div className="flex sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
              Fermer la vue
            </Button>
          </div>
        }
      >
        {selectedLog && (
          <div className="space-y-5 text-sm">
              {/* Ligne 1: Action et Criticité */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Action système
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0.5 text-xs font-semibold ${
                        ACTION_TRANSLATIONS[selectedLog.action]?.color
                      }`}
                    >
                      {ACTION_TRANSLATIONS[selectedLog.action]?.label || selectedLog.action}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Criticité / Gravité
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={`gap-1.5 px-2 py-0.5 text-xs font-medium ${
                        SEVERITY_TRANSLATIONS[selectedLog.severity]?.color
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          SEVERITY_TRANSLATIONS[selectedLog.severity]?.dot
                        }`}
                      />
                      {SEVERITY_TRANSLATIONS[selectedLog.severity]?.label || selectedLog.severity}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Ligne 2: Administrateur et Date */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-2.5 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground mt-0.5">
                    <HugeiconsIcon icon={UserIcon} className="size-4" size={16} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                      Opérateur back-office
                    </label>
                    <p className="font-semibold text-foreground mt-0.5">
                      {selectedLog.adminName}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Rôle: {selectedLog.adminRole} (ID: {selectedLog.adminId})
                    </p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground mt-0.5">
                    <HugeiconsIcon icon={Calendar03Icon} className="size-4" size={16} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                      Date et heure UTC
                    </label>
                    <p className="font-semibold text-foreground mt-0.5">
                      {formatAuditDate(selectedLog.createdAt)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Format stable SSR / Client
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-border/60" />

              {/* Ligne 3: Cible de l’action */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Cible de la décision
                </label>
                <div className="mt-1.5 p-3 rounded-lg border border-border/60 bg-muted/30">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground block leading-none">
                        Type de cible
                      </span>
                      <span className="text-xs font-bold text-foreground mt-1 block">
                        {TARGET_TYPE_TRANSLATIONS[selectedLog.targetType] || selectedLog.targetType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block leading-none">
                        Identifiant cible
                      </span>
                      <span className="text-xs font-mono font-bold text-foreground mt-1 block">
                        {selectedLog.targetId}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block leading-none">
                        Nom ou Label
                      </span>
                      <span className="text-xs font-medium text-foreground mt-1 block truncate">
                        {selectedLog.targetLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ligne 4: Motif/Justificatif */}
              {selectedLog.reason && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Justificatif de l’action
                  </label>
                  <p className="mt-1 p-3 rounded-lg border border-border/60 bg-muted/40 text-xs italic leading-relaxed text-foreground select-text">
                    « {selectedLog.reason} »
                  </p>
                </div>
              )}

              {/* Ligne 5: Données IP & Système */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                    Adresse IP source
                  </span>
                  <span className="font-mono mt-0.5 block">{selectedLog.ipAddress}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                    Agent utilisateur (Browser)
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[10px]" title={selectedLog.userAgent}>
                    {selectedLog.userAgent}
                  </span>
                </div>
              </div>

              {/* Ligne 6: Métadonnées JSON complètes (overflow-x-auto, select-all, text-xs) */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Métadonnées détaillées (JSON)
                </label>
                <pre className="bg-muted text-[11px] p-3 rounded-md overflow-x-auto select-all max-h-[200px] font-mono leading-normal border border-border/60">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>
        )}

      </AppDialog>
    </div>
  );
}

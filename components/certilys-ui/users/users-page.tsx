"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
  Download01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  LockPasswordIcon,
  EyeIcon,
  UserBlock01Icon,
  UserCheck01Icon,
  Loading02Icon,
  InboxIcon,
  SearchRemoveIcon,
  UserMultiple02Icon,
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCsvForExcel } from "@/lib/csv-export";

import {
  type AccountStatus,
  type UserRole,
  mockAdminUsers,
  userKpis,
  USER_ROLE_CONFIG,
  ACCOUNT_STATUS_CONFIG,
  formatDateTime,
} from "@/lib/mock/admin-users-data";

// ─────────────────────────────────────────────────────────────────────────────
// Badge rôle
// ─────────────────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = USER_ROLE_CONFIG[role];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2 py-0.5 text-xs font-medium ${cfg.colorClass}`}
    >
      {cfg.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge statut
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AccountStatus }) {
  const cfg = ACCOUNT_STATUS_CONFIG[status];
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
// KPI compacts
// ─────────────────────────────────────────────────────────────────────────────

const KPI_ICONS: Record<string, IconSvgElement> = {
  total: UserMultiple02Icon,
  active: CheckmarkCircle02Icon,
  suspended: UserBlock01Icon,
  "2fa": LockPasswordIcon,
};

function UserKpiCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {userKpis.map((kpi) => {
        const Icon = KPI_ICONS[kpi.id];
        return (
          <Card
            key={kpi.id}
            id={`kpi-user-${kpi.id}`}
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
                    {kpi.value.toLocaleString("fr-FR")}
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
// États vides
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ type }: { type: "empty" | "no-results" }) {
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
                Aucun utilisateur
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aucun compte utilisateur n&apos;a été trouvé.
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
              Aucun utilisateur ne correspond à vos critères.
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton ligne
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-7 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-7 w-20 ml-auto" />
      </TableCell>
    </TableRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Indicateur Oui / Non
// ─────────────────────────────────────────────────────────────────────────────

function BoolIndicator({ value }: { value: boolean }) {
  if (value) {
    return (
      <HugeiconsIcon
        icon={CheckmarkCircle02Icon}
        className="size-4 text-emerald-500"
        size={16}
        strokeWidth={1.5}
        aria-label="Oui"
      />
    );
  }
  return (
    <HugeiconsIcon
      icon={Cancel01Icon}
      className="size-4 text-muted-foreground/50"
      size={16}
      strokeWidth={1.5}
      aria-label="Non"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  // ── nuqs : état URL
  const [statusParam, setStatusParam] = useQueryState("status", {
    defaultValue: "",
  });

  // ── État local
  const [searchValue, setSearchValue] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<
    Record<string, string>
  >({
    role: "",
    status: statusParam ?? "",
    emailVerified: "",
    twoFactor: "",
    onboarding: "",
    lastLoginFrom: "",
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
      role: "",
      status: "",
      emailVerified: "",
      twoFactor: "",
      onboarding: "",
      lastLoginFrom: "",
    };
    setFilterValues(empty);
    setStatusParam(null);
  }, [setStatusParam]);

  // ── Loading initial simulé
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // ── État local des données (pour suspension/réactivation mock)
  const [data, setData] = React.useState(mockAdminUsers);

  // ── État de l'action en cours (suspend/reactivate inline)
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);

  // ── Filtrage
  const filteredData = React.useMemo(() => {
    return data.filter((user) => {
      const q = searchValue.toLowerCase().trim();
      if (
        q &&
        !user.fullName.toLowerCase().includes(q) &&
        !user.email.toLowerCase().includes(q) &&
        !user.country.toLowerCase().includes(q)
      ) {
        return false;
      }

      if (filterValues.role && user.role !== filterValues.role) return false;
      if (filterValues.status && user.status !== filterValues.status)
        return false;
      if (filterValues.emailVerified === "true" && !user.security.emailVerified)
        return false;
      if (
        filterValues.emailVerified === "false" &&
        user.security.emailVerified
      )
        return false;
      if (
        filterValues.twoFactor === "true" &&
        !user.security.twoFactorEnabled
      )
        return false;
      if (filterValues.twoFactor === "false" && user.security.twoFactorEnabled)
        return false;
      if (filterValues.onboarding === "true" && !user.onboarding.completed)
        return false;
      if (filterValues.onboarding === "false" && user.onboarding.completed)
        return false;
      if (filterValues.lastLoginFrom && user.security.lastLoginAt) {
        if (
          new Date(user.security.lastLoginAt) <
          new Date(filterValues.lastLoginFrom)
        )
          return false;
      }

      return true;
    });
  }, [data, searchValue, filterValues]);

  // ── Actions Suspendre / Réactiver (mock)
  async function handleSuspend(userId: string) {
    setPendingAction(userId);
    await new Promise((r) => setTimeout(r, 900));
    setData((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: "SUSPENDED" as AccountStatus,
              suspendedAt: new Date().toISOString(),
              suspensionReason: "Suspension manuelle par l'administrateur.",
              suspendedBy: "admin@certilys.com",
            }
          : u,
      ),
    );
    console.log("[AUDIT] USER_SUSPENDED", {
      userId,
      timestamp: new Date().toISOString(),
    });
    setPendingAction(null);
  }

  async function handleReactivate(userId: string) {
    setPendingAction(userId);
    await new Promise((r) => setTimeout(r, 900));
    setData((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: "ACTIVE" as AccountStatus,
              suspendedAt: undefined,
              suspensionReason: undefined,
              suspendedBy: undefined,
            }
          : u,
      ),
    );
    console.log("[AUDIT] USER_REACTIVATED", {
      userId,
      timestamp: new Date().toISOString(),
    });
    setPendingAction(null);
  }

  // ── Export CSV
  function handleExportCsv() {
    const headers = [
      "ID",
      "Nom",
      "Email",
      "Rôle",
      "Statut",
      "Email vérifié",
      "2FA",
      "Onboarding",
      "Dernière connexion",
    ];
    const rows = filteredData.map((user) => [
      user.id,
      user.fullName,
      user.email,
      USER_ROLE_CONFIG[user.role].label,
      ACCOUNT_STATUS_CONFIG[user.status].label,
      user.security.emailVerified ? "Oui" : "Non",
      user.security.twoFactorEnabled ? "Oui" : "Non",
      user.onboarding.completed ? "Complet" : "Incomplet",
      user.security.lastLoginAt ?? "—",
    ]);

    downloadCsvForExcel(
      `certilys-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    );
  }

  // ── Filtres SearchFilter
  const inputDateClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  const filters: FilterField[] = [
    {
      id: "role",
      label: "Rôle",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-role-user" className="w-full">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LEARNER">Apprenant</SelectItem>
            <SelectItem value="INSTRUCTOR">Formateur</SelectItem>
            <SelectItem value="MODERATOR">Modérateur</SelectItem>
            <SelectItem value="ADMIN">Administrateur</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "status",
      label: "Statut compte",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-status-user" className="w-full">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="SUSPENDED">Suspendu</SelectItem>
            <SelectItem value="DELETED">Supprimé</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "emailVerified",
      label: "Email vérifié",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-email-user" className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Vérifié</SelectItem>
            <SelectItem value="false">Non vérifié</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "twoFactor",
      label: "2FA",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-2fa-user" className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Activée</SelectItem>
            <SelectItem value="false">Désactivée</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "onboarding",
      label: "Onboarding",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-onboarding-user" className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Complet</SelectItem>
            <SelectItem value="false">Incomplet</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "lastLoginFrom",
      label: "Dernière connexion depuis",
      render: (value, onChange) => (
        <input
          id="sf-filter-lastLogin-user"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputDateClass}
        />
      ),
    },
  ];

  const activeFilterCount = Object.values(filterValues).filter(Boolean).length;
  const hasData = data.length > 0;
  const hasResults = filteredData.length > 0;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      {/* ── 1. Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-sora">
            Utilisateurs
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Supervision des comptes, statuts et accès Certilys.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            id="btn-export-csv-users"
            variant="outline"
            size="sm"
            className="gap-2 border-border text-foreground hover:bg-muted"
            onClick={handleExportCsv}
            aria-label="Exporter les utilisateurs au format CSV"
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
            id="btn-comptes-suspendus"
            asChild
            size="sm"
            className="gap-2"
          >
            <Link
              href="/dashboard/users?status=SUSPENDED"
              aria-label="Voir les comptes suspendus"
              onClick={() => {
                setStatusParam("SUSPENDED");
                setFilterValues((prev) => ({ ...prev, status: "SUSPENDED" }));
              }}
            >
              <HugeiconsIcon
                icon={UserBlock01Icon}
                className="size-4"
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>Comptes suspendus</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 2. KPI compacts ────────────────────────────────────────────────── */}
      <UserKpiCards />

      {/* ── 3. Recherche + filtres ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <SearchFilter
          placeholder="Rechercher un utilisateur, email, pays…"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filters}
          filterValues={filterValues}
          onFiltersApply={handleFiltersApply}
          onFiltersReset={handleFiltersReset}
          sheetTitle="Filtrer les utilisateurs"
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
              <TableHead className="min-w-[220px]">Utilisateur</TableHead>
              <TableHead className="min-w-[120px]">Rôle</TableHead>
              <TableHead className="min-w-[110px]">Statut</TableHead>
              <TableHead className="min-w-[90px] text-center">
                Email vérifié
              </TableHead>
              <TableHead className="min-w-[60px] text-center">2FA</TableHead>
              <TableHead className="min-w-[100px] text-center">
                Onboarding
              </TableHead>
              <TableHead className="min-w-[160px]">Dernière connexion</TableHead>
              <TableHead className="min-w-[180px] text-right">
                Décision
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading */}
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}

            {/* Données chargées */}
            {!loading && !hasData && <EmptyState type="empty" />}
            {!loading && hasData && !hasResults && (
              <EmptyState type="no-results" />
            )}

            {!loading &&
              hasResults &&
              filteredData.map((user) => {
                const isDeleted = user.status === "DELETED";
                const isSuspended = user.status === "SUSPENDED";
                const isPending = pendingAction === user.id;

                return (
                  <TableRow
                    key={user.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    {/* Utilisateur */}
                    <TableCell>
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        id={`user-row-${user.id}`}
                        className="flex items-center gap-2.5 min-w-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
                      >
                        <div
                          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${user.avatarColor}`}
                        >
                          {user.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {user.email}
                          </p>
                        </div>
                      </Link>
                    </TableCell>

                    {/* Rôle */}
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>

                    {/* Email vérifié */}
                    <TableCell className="text-center">
                      <BoolIndicator value={user.security.emailVerified} />
                    </TableCell>

                    {/* 2FA */}
                    <TableCell className="text-center">
                      <BoolIndicator value={user.security.twoFactorEnabled} />
                    </TableCell>

                    {/* Onboarding */}
                    <TableCell className="text-center">
                      <BoolIndicator value={user.onboarding.completed} />
                    </TableCell>

                    {/* Dernière connexion */}
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(user.security.lastLoginAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Voir profil */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                          asChild
                        >
                          <Link
                            href={`/dashboard/users/${user.id}`}
                            id={`btn-view-user-${user.id}`}
                            aria-label={`Voir le profil de ${user.fullName}`}
                          >
                            <HugeiconsIcon
                              icon={EyeIcon}
                              className="size-3.5"
                              size={14}
                              strokeWidth={1.5}
                            />
                            Profil
                          </Link>
                        </Button>

                        {/* Suspendre / Réactiver — masqué si DELETED */}
                        {!isDeleted && (
                          <>
                            {isSuspended ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                id={`btn-reactivate-user-${user.id}`}
                                disabled={isPending}
                                onClick={() => handleReactivate(user.id)}
                                aria-label={`Réactiver le compte de ${user.fullName}`}
                              >
                                {isPending ? (
                                  <HugeiconsIcon
                                    icon={Loading02Icon}
                                    className="size-3.5 animate-spin"
                                    size={14}
                                    strokeWidth={1.5}
                                  />
                                ) : (
                                  <HugeiconsIcon
                                    icon={UserCheck01Icon}
                                    className="size-3.5"
                                    size={14}
                                    strokeWidth={1.5}
                                  />
                                )}
                                Réactiver
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5 px-2 text-xs text-chart-4 hover:text-chart-4 hover:bg-chart-4/10"
                                id={`btn-suspend-user-${user.id}`}
                                disabled={isPending}
                                onClick={() => handleSuspend(user.id)}
                                aria-label={`Suspendre le compte de ${user.fullName}`}
                              >
                                {isPending ? (
                                  <HugeiconsIcon
                                    icon={Loading02Icon}
                                    className="size-3.5 animate-spin"
                                    size={14}
                                    strokeWidth={1.5}
                                  />
                                ) : (
                                  <HugeiconsIcon
                                    icon={UserBlock01Icon}
                                    className="size-3.5"
                                    size={14}
                                    strokeWidth={1.5}
                                  />
                                )}
                                Suspendre
                              </Button>
                            )}
                          </>
                        )}

                        {/* Compte supprimé : lecture seule */}
                        {isDeleted && (
                          <span className="text-xs text-muted-foreground px-2 italic">
                            Lecture seule
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

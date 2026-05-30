"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft01Icon,
  Alert01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Mail01Icon,
  Location01Icon,
  Calendar01Icon,
  Shield01Icon,
  UserBlock01Icon,
  UserCheck01Icon,
  SmartPhone01Icon,
  Book01Icon,
  InvoiceIcon,
  UserIcon,
  Clock01Icon,
  CheckmarkSquare01Icon,
  SecurityLockIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DecisionDialog } from "@/components/certilys-ui/dialogs";

import {
  type AdminUser,
  type AccountStatus,
  mockAdminUsers,
  USER_ROLE_CONFIG,
  ACCOUNT_STATUS_CONFIG,
  formatDate,
  formatDateTime,
  formatAmount,
} from "@/lib/mock/admin-users-data";

// ─────────────────────────────────────────────────────────────────────────────
// Types dialog
// ─────────────────────────────────────────────────────────────────────────────

type SensitiveAction = "suspend" | "reactivate" | "disable-2fa";

interface ActionDialogState {
  open: boolean;
  type: SensitiveAction | null;
  reason: string;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config actions
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  SensitiveAction,
  {
    label: string;
    description: string;
    confirmLabel: string;
    requiresReason: boolean;
    reasonLabel: string;
    reasonPlaceholder: string;
    variant: "default" | "destructive";
    auditEvent: string;
  }
> = {
  suspend: {
    label: "Suspendre le compte",
    description:
      "Le compte sera immédiatement suspendu. L'utilisateur ne pourra plus accéder aux fonctionnalités protégées. Cette action sera consignée dans les logs d'audit.",
    confirmLabel: "Suspendre",
    requiresReason: true,
    reasonLabel: "Motif de suspension (obligatoire)",
    reasonPlaceholder: "Décrivez la raison de la suspension…",
    variant: "destructive",
    auditEvent: "USER_SUSPENDED",
  },
  reactivate: {
    label: "Réactiver le compte",
    description:
      "Le compte sera réactivé. L'utilisateur retrouvera accès à toutes les fonctionnalités. Cette action sera consignée dans les logs d'audit.",
    confirmLabel: "Réactiver",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    variant: "default",
    auditEvent: "USER_REACTIVATED",
  },
  "disable-2fa": {
    label: "Désactiver la 2FA",
    description:
      "La double authentification sera désactivée pour ce compte. Cette action est irréversible sans intervention de l'utilisateur et doit être motivée par un cas critique uniquement.",
    confirmLabel: "Désactiver la 2FA",
    requiresReason: true,
    reasonLabel: "Motif critique (obligatoire)",
    reasonPlaceholder: "Décrivez le cas critique justifiant cette action…",
    variant: "destructive",
    auditEvent: "TWO_FACTOR_DISABLED_BY_ADMIN",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Simulation API
// ─────────────────────────────────────────────────────────────────────────────

async function simulateApiCall(
  type: SensitiveAction,
  userId: string,
  reason?: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 1200));
  if (Math.random() < 0.03) {
    throw new Error("Erreur serveur. Veuillez réessayer.");
  }
  const endpointMap: Record<SensitiveAction, string> = {
    suspend: `/admin/users/${userId}/suspend`,
    reactivate: `/admin/users/${userId}/reactivate`,
    "disable-2fa": `/admin/users/${userId}/disable-2fa`,
  };
  console.log(`[AUDIT] ${ACTION_CONFIG[type].auditEvent}`, {
    userId,
    reason,
    endpoint: endpointMap[type],
    timestamp: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Badges
// ─────────────────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  const cfg = USER_ROLE_CONFIG[role];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2.5 py-1 text-xs font-medium ${cfg.colorClass}`}
    >
      {cfg.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const cfg = ACCOUNT_STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2.5 py-1 text-xs font-medium ${cfg.colorClass}`}
    >
      <span className={`size-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
      {cfg.label}
    </Badge>
  );
}

function BoolBadge({ value, labelTrue, labelFalse }: { value: boolean; labelTrue: string; labelFalse: string }) {
  if (value) {
    return (
      <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-500/40 bg-emerald-500/10 text-xs">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" size={12} strokeWidth={1.5} />
        {labelTrue}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5 text-muted-foreground border-border bg-muted/40 text-xs">
      <HugeiconsIcon icon={Cancel01Icon} className="size-3" size={12} strokeWidth={1.5} />
      {labelFalse}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Card Helper
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 py-2 border-b border-border/30 gap-2 last:border-0">
      <span className="text-xs text-muted-foreground col-span-1 pt-0.5">{label}</span>
      <div className="font-medium text-foreground col-span-2 text-right text-sm flex items-center justify-end gap-1.5">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Statut badge commande
// ─────────────────────────────────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: AdminUser["linkedActivity"]["recentOrders"][0]["status"] }) {
  const map = {
    COMPLETED: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    PENDING: "text-amber-600 border-amber-500/40 bg-amber-500/10",
    FAILED: "text-chart-4 border-chart-4/40 bg-chart-4/10",
    REFUNDED: "text-muted-foreground border-border bg-muted/40",
  } as const;
  const labels = {
    COMPLETED: "Complétée",
    PENDING: "En attente",
    FAILED: "Échouée",
    REFUNDED: "Remboursée",
  };
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${map[status]}`}>
      {labels[status]}
    </Badge>
  );
}

function EnrollmentStatusBadge({ status }: { status: AdminUser["linkedActivity"]["enrollments"][0]["status"] }) {
  const map = {
    ACTIVE: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    COMPLETED: "text-primary border-primary/40 bg-primary/10",
    EXPIRED: "text-muted-foreground border-border bg-muted/40",
  } as const;
  const labels = { ACTIVE: "En cours", COMPLETED: "Terminé", EXPIRED: "Expiré" };
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${map[status]}`}>
      {labels[status]}
    </Badge>
  );
}

function CourseStatusBadge({ status }: { status: NonNullable<AdminUser["linkedActivity"]["courses"]>[0]["status"] }) {
  const map = {
    DRAFT: "text-muted-foreground border-border bg-muted/40",
    SUBMITTED: "text-amber-600 border-amber-500/40 bg-amber-500/10",
    APPROVED: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    REJECTED: "text-chart-4 border-chart-4/40 bg-chart-4/10",
    ARCHIVED: "text-muted-foreground border-border bg-muted/40",
  } as const;
  const labels = {
    DRAFT: "Brouillon",
    SUBMITTED: "Soumise",
    APPROVED: "Approuvée",
    REJECTED: "Rejetée",
    ARCHIVED: "Archivée",
  };
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${map[status]}`}>
      {labels[status]}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    const found = mockAdminUsers.find((u) => u.id === id);
    if (found) {
      setUser(JSON.parse(JSON.stringify(found)));
    } else {
      setLoadError(true);
    }
  }, [id]);

  // Dialog
  const [dialog, setDialog] = React.useState<ActionDialogState>({
    open: false,
    type: null,
    reason: "",
    loading: false,
    error: null,
    success: false,
  });

  function openAction(type: SensitiveAction) {
    setDialog({ open: true, type, reason: "", loading: false, error: null, success: false });
  }

  function closeDialog() {
    if (dialog.loading) return;
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleConfirm(reasonOverride?: string) {
    if (!dialog.type || !user) return;
    const reason = reasonOverride ?? dialog.reason;
    setDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await simulateApiCall(dialog.type, user.id, reason);

      setUser((prev) => {
        if (!prev) return prev;
        if (dialog.type === "suspend") {
          return {
            ...prev,
            status: "SUSPENDED" as AccountStatus,
            suspendedAt: new Date().toISOString(),
            suspensionReason: reason,
            suspendedBy: "admin@certilys.com",
          };
        }
        if (dialog.type === "reactivate") {
          return {
            ...prev,
            status: "ACTIVE" as AccountStatus,
            suspendedAt: undefined,
            suspensionReason: undefined,
            suspendedBy: undefined,
          };
        }
        if (dialog.type === "disable-2fa") {
          return {
            ...prev,
            security: { ...prev.security, twoFactorEnabled: false },
          };
        }
        return prev;
      });

      setDialog((prev) => ({ ...prev, open: false, loading: false, success: true }));
    } catch (err) {
      setDialog((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Une erreur est survenue.",
      }));
    }
  }

  // ── Erreur chargement
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 px-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-7 text-destructive" size={28} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">Utilisateur introuvable</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ce compte n&apos;existe pas ou a été supprimé définitivement.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/users">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" size={16} strokeWidth={1.5} />
            Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  // ── Loading skeleton
  if (!user) {
    return (
      <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-48 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  const isDeleted = user.status === "DELETED";
  const isSuspended = user.status === "SUSPENDED";
  const isActive = user.status === "ACTIVE";
  const isAdminOrMod = user.role === "ADMIN" || user.role === "MODERATOR";
  const isInstructor = user.role === "INSTRUCTOR";

  const dialogCfg = ACTION_CONFIG[dialog.type ?? "suspend"];

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">

      {/* ── En-tête de page ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard/users" id="btn-back-to-users">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" size={16} strokeWidth={1.5} />
              Utilisateurs
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <StatusBadge status={user.status} />
        </div>

        {/* Actions sensibles — désactivées si DELETED */}
        {!isDeleted && (
          <div className="flex items-center gap-2 flex-wrap">
            {isSuspended && (
              <Button
                id="btn-detail-reactivate"
                variant="outline"
                size="sm"
                className="gap-2 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                onClick={() => openAction("reactivate")}
              >
                <HugeiconsIcon icon={UserCheck01Icon} className="size-4" size={16} strokeWidth={1.5} />
                Réactiver
              </Button>
            )}

            {isActive && (
              <Button
                id="btn-detail-suspend"
                variant="outline"
                size="sm"
                className="gap-2 border-chart-4/40 text-chart-4 hover:bg-chart-4/10"
                onClick={() => openAction("suspend")}
              >
                <HugeiconsIcon icon={UserBlock01Icon} className="size-4" size={16} strokeWidth={1.5} />
                Suspendre
              </Button>
            )}

            {user.security.twoFactorEnabled && (
              <Button
                id="btn-detail-disable-2fa"
                variant="outline"
                size="sm"
                className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => openAction("disable-2fa")}
              >
                <HugeiconsIcon icon={SecurityLockIcon} className="size-4" size={16} strokeWidth={1.5} />
                Désactiver 2FA
              </Button>
            )}
          </div>
        )}

        {/* Compte supprimé → bannière */}
        {isDeleted && (
          <Badge variant="outline" className="gap-1.5 text-muted-foreground border-border">
            Compte supprimé — lecture seule
          </Badge>
        )}
      </div>

      {/* ── Alerte compte suspendu ──────────────────────────────────────────── */}
      {isSuspended && user.suspensionReason && (
        <div className="flex items-start gap-3 rounded-xl border border-chart-4/30 bg-chart-4/5 px-4 py-3.5 text-sm">
          <HugeiconsIcon
            icon={Alert01Icon}
            className="size-5 shrink-0 mt-0.5 text-chart-4"
            size={20}
            strokeWidth={1.5}
          />
          <div className="space-y-1">
            <strong className="font-semibold block text-chart-4">Compte suspendu</strong>
            <span className="text-muted-foreground text-xs block">
              {user.suspensionReason}
            </span>
            <span className="text-muted-foreground text-xs block">
              Suspendu le {formatDateTime(user.suspendedAt)} par {user.suspendedBy ?? "—"}
            </span>
          </div>
        </div>
      )}

      {/* ── 1. Identité ──────────────────────────────────────────────────── */}
      <Card className="border-border/60 shadow-none">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
          {/* Avatar */}
          <div
            className={`flex size-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold ${user.avatarColor}`}
          >
            {user.initials}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground font-sora">
                {user.fullName}
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5 shrink-0" size={14} strokeWidth={1.5} />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5 shrink-0" size={14} strokeWidth={1.5} />
                {user.country}
              </span>
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Clock01Icon} className="size-3.5 shrink-0" size={14} strokeWidth={1.5} />
                {user.timezone}
              </span>
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Calendar01Icon} className="size-3.5 shrink-0" size={14} strokeWidth={1.5} />
                Inscrit le {formatDate(user.createdAt)}
              </span>
            </div>
          </div>

          {/* Rôle badge */}
          <div className="shrink-0">
            <RoleBadge role={user.role} />
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Sécurité + Sessions ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sécurité */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Shield01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 text-sm">
            <InfoRow label="Email vérifié">
              <BoolBadge value={user.security.emailVerified} labelTrue="Vérifié" labelFalse="Non vérifié" />
            </InfoRow>
            <InfoRow label="Fournisseur auth">
              <span className="text-foreground text-sm">{user.security.authProvider}</span>
            </InfoRow>
            <InfoRow label="2FA">
              <BoolBadge value={user.security.twoFactorEnabled} labelTrue="Activée" labelFalse="Désactivée" />
            </InfoRow>
            <InfoRow label="Dernière connexion">
              <span className="text-xs">{formatDateTime(user.security.lastLoginAt)}</span>
            </InfoRow>
            <InfoRow label="Dernière IP">
              <span className="text-xs font-mono">{user.security.lastLoginIp ?? "—"}</span>
            </InfoRow>
            <InfoRow label="Localisation">
              <span className="text-xs">{user.security.lastLoginLocation ?? "—"}</span>
            </InfoRow>
          </CardContent>
        </Card>

        {/* Sessions actives */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={SmartPhone01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              Sessions actives
              <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0">
                {user.security.activeSessions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.security.activeSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aucune session active
              </p>
            ) : (
              <div className="space-y-3">
                {user.security.activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium text-foreground truncate">{session.device}</p>
                      <p className="text-xs text-muted-foreground">{session.location}</p>
                      <p className="text-xs text-muted-foreground font-mono">{session.ip}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(session.lastActive)}</p>
                    </div>
                    {session.isCurrent && (
                      <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 text-emerald-600 border-emerald-500/40 bg-emerald-500/10">
                        Actuelle
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Onboarding ───────────────────────────────────────────────── */}
      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
            Onboarding
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6 flex-wrap">
          {/* Barre progression */}
          <div className="flex-1 min-w-[200px] space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Étape {user.onboarding.currentStep} / {user.onboarding.totalSteps}</span>
              <span>{Math.round((user.onboarding.currentStep / user.onboarding.totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(user.onboarding.currentStep / user.onboarding.totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-sm">
            <BoolBadge
              value={user.onboarding.completed}
              labelTrue="Onboarding complet"
              labelFalse="Onboarding incomplet"
            />
            {user.onboarding.completedAt && (
              <span className="text-xs text-muted-foreground">
                Complété le {formatDate(user.onboarding.completedAt)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Activité liée ─────────────────────────────────────────────── */}
      <h2 className="text-lg font-semibold tracking-tight text-foreground font-sora">
        Activité liée
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Commandes récentes */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={InvoiceIcon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              Commandes récentes
              <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0">
                {user.linkedActivity.recentOrders.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.linkedActivity.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune commande</p>
            ) : (
              <div className="space-y-3">
                {user.linkedActivity.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium text-foreground truncate">{order.courseTitle}</p>
                      <p className="text-xs text-muted-foreground font-mono">{order.reference}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <p className="text-xs font-semibold text-foreground tabular-nums">
                        {formatAmount(order.amount, order.currency)}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrollments */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Book01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              Formations suivies
              <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0">
                {user.linkedActivity.enrollments.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.linkedActivity.enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune formation suivie</p>
            ) : (
              <div className="space-y-3">
                {user.linkedActivity.enrollments.map((enr) => (
                  <div key={enr.id} className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{enr.courseTitle}</p>
                        <p className="text-xs text-muted-foreground">{enr.instructorName}</p>
                      </div>
                      <EnrollmentStatusBadge status={enr.status} />
                    </div>
                    {/* Barre progression */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progression</span>
                        <span>{enr.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formations créées (si Formateur) */}
        {isInstructor && user.linkedActivity.courses && (
          <Card className="border-border/60 shadow-none lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
                Formations créées (formateur)
                <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0">
                  {user.linkedActivity.courses.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {user.linkedActivity.courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium text-foreground truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.studentsCount} apprenants · {course.submittedAt ? formatDate(course.submittedAt) : "Non soumise"}
                      </p>
                    </div>
                    <CourseStatusBadge status={course.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions admin (si Admin/Modérateur) */}
        {isAdminOrMod && user.linkedActivity.adminActions && user.linkedActivity.adminActions.length > 0 && (
          <Card className="border-border/60 shadow-none lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={UserMultiple02Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
                Actions administratives récentes
                <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0">
                  {user.linkedActivity.adminActions.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.linkedActivity.adminActions.map((action) => (
                  <div key={action.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <HugeiconsIcon icon={Shield01Icon} className="size-3.5 text-primary" size={14} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {action.action}
                        <span className="ml-2 font-normal text-muted-foreground">
                          → {action.targetType} : {action.targetLabel}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(action.performedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── 5. Statut du compte ──────────────────────────────────────────── */}
      {isDeleted && user.deletedAt && (
        <Card className="border-destructive/20 bg-destructive/5 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
              <HugeiconsIcon icon={Cancel01Icon} className="size-4 shrink-0" size={16} strokeWidth={1.5} />
              Compte supprimé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ce compte a été marqué comme supprimé le {formatDateTime(user.deletedAt)}.
              Il est désormais en lecture seule. Aucune action directe n&apos;est disponible
              conformément à la politique MVP de Certilys (pas de suppression physique).
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Dialog confirmation ─────────────────────────────────────────────── */}
      {dialog.type && (
        <DecisionDialog
          open={dialog.open}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          title={dialogCfg.label}
          description={dialogCfg.description}
          tone={dialogCfg.variant === "destructive" ? "danger" : "success"}
          profile={{
            name: user.fullName,
            email: user.email,
            initials: user.initials,
            status: user.status,
          }}
          requireReason={dialogCfg.requiresReason}
          reasonLabel={dialogCfg.reasonLabel}
          reasonPlaceholder={dialogCfg.reasonPlaceholder}
          minReasonLength={10}
          confirmLabel={dialogCfg.confirmLabel}
          cancelLabel="Annuler"
          loading={dialog.loading}
          error={dialog.error}
          onConfirm={({ reason }) => handleConfirm(reason)}
        />
      )}
    </div>
  );
}

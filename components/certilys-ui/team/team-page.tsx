"use client";

import * as React from "react";
import {
  UserStar01Icon,
  UserGroupIcon,
  MailSendIcon,
  UserBlock01Icon,
  UserCheck01Icon,
  EyeIcon,
  Loading02Icon,
  InboxIcon,
  SearchRemoveIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  UserIcon,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDialog, DecisionDialog, InternalProfileDialog } from "@/components/certilys-ui/dialogs";
import {
  inviteAdminTeamMemberAction,
  reactivateAdminTeamMemberAction,
  resendAdminInvitationAction,
  suspendAdminTeamMemberAction,
} from "@/lib/admin-team-actions";

import {
  type TeamMember,
  type TeamKpis,
  type TeamRole,
  type TeamMemberStatus,
  getTeamKpis,
} from "@/lib/mock/admin-team-data";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration et Badge Rôle
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<TeamRole, { label: string; colorClass: string }> = {
  ADMIN: {
    label: "Administrateur",
    colorClass: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  },
  MODERATOR: {
    label: "Modérateur",
    colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
};

function RoleBadge({ role }: { role: TeamRole }) {
  const cfg = ROLE_CONFIG[role];
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
// Configuration et Badge Statut
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TeamMemberStatus, { label: string; colorClass: string; dotClass: string }> = {
  ACTIVE: {
    label: "Actif",
    colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  SUSPENDED: {
    label: "Suspendu",
    colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    dotClass: "bg-amber-500",
  },
  INVITED: {
    label: "Invité",
    colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    dotClass: "bg-purple-500",
  },
};

function StatusBadge({ status }: { status: TeamMemberStatus }) {
  const cfg = STATUS_CONFIG[status];
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
// Indicateur Booléen
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
      className="size-4 text-muted-foreground/40"
      size={16}
      strokeWidth={1.5}
      aria-label="Non"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatage de la date
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Équipe interne
// ─────────────────────────────────────────────────────────────────────────────

type TeamPageProps = {
  initialMembers: TeamMember[];
  initialKpis?: TeamKpis;
};

export default function TeamPage({ initialMembers, initialKpis }: TeamPageProps) {
  // ── États locaux
  const [searchValue, setSearchValue] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({
    role: "",
    status: "",
    twoFactor: "",
  });

  const loading = false;
  const [data, setData] = React.useState<TeamMember[]>(initialMembers);
  const [actionPending, setActionPending] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // États pour les Dialogs
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [newMember, setNewMember] = React.useState({ name: "", email: "", role: "ADMIN" as TeamRole });

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState<"suspend" | "reactivate" | "resend" | null>(null);
  const [targetMember, setTargetMember] = React.useState<TeamMember | null>(null);

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [profileMember, setProfileMember] = React.useState<TeamMember | null>(null);

  const kpis = React.useMemo(
    () =>
      data === initialMembers && initialKpis ? initialKpis : getTeamKpis(data),
    [data, initialKpis, initialMembers],
  );

  // Filtrage des membres
  const filteredData = React.useMemo(() => {
    return data.filter((member) => {
      const q = searchValue.toLowerCase().trim();
      if (q && !member.name.toLowerCase().includes(q) && !member.email.toLowerCase().includes(q)) {
        return false;
      }
      if (filterValues.role && member.role !== filterValues.role) return false;
      if (filterValues.status && member.status !== filterValues.status) return false;
      if (filterValues.twoFactor === "true" && !member.twoFactorEnabled) return false;
      if (filterValues.twoFactor === "false" && member.twoFactorEnabled) return false;
      return true;
    });
  }, [data, searchValue, filterValues]);

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    setActionPending("invite");
    setActionError(null);
    try {
      const invited = await inviteAdminTeamMemberAction({
        displayName: newMember.name,
        email: newMember.email,
        role: newMember.role,
      });
      setData((prev) => [invited, ...prev.filter((item) => item.email !== invited.email)]);
      setNewMember({ name: "", email: "", role: "ADMIN" });
      setInviteOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Impossible d'envoyer l'invitation.");
    } finally {
      setActionPending(null);
    }
  }

  async function handleSuspendConfirm() {
    if (!targetMember) return;
    setActionPending(targetMember.id);
    setConfirmOpen(false);
    setActionError(null);

    try {
      const updated = await suspendAdminTeamMemberAction(targetMember.id);
      setData((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setTargetMember(null);
      setConfirmType(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Impossible de suspendre ce compte.");
    } finally {
      setActionPending(null);
    }
  }

  async function handleReactivateConfirm() {
    if (!targetMember) return;
    setActionPending(targetMember.id);
    setConfirmOpen(false);
    setActionError(null);

    try {
      const updated = await reactivateAdminTeamMemberAction(targetMember.id);
      setData((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setTargetMember(null);
      setConfirmType(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Impossible de réactiver ce compte.");
    } finally {
      setActionPending(null);
    }
  }

  async function handleResendConfirm() {
    if (!targetMember) return;
    setActionPending(targetMember.id);
    setConfirmOpen(false);
    setActionError(null);

    try {
      const updated = await resendAdminInvitationAction(targetMember.id);
      setData((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setTargetMember(null);
      setConfirmType(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Impossible de renvoyer l'invitation.");
    } finally {
      setActionPending(null);
    }
  }

  const triggerConfirm = (type: "suspend" | "reactivate" | "resend", member: TeamMember) => {
    setConfirmType(type);
    setTargetMember(member);
    setConfirmOpen(true);
  };

  const filters: FilterField[] = [
    {
      id: "role",
      label: "Rôle",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-role-team" className="w-full">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrateur</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "status",
      label: "Statut",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-status-team" className="w-full">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="SUSPENDED">Suspendu</SelectItem>
            <SelectItem value="INVITED">Invité</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "twoFactor",
      label: "Sécurité 2FA",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-2fa-team" className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">2FA Activée</SelectItem>
            <SelectItem value="false">2FA Désactivée</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  const activeFilterCount = Object.values(filterValues).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      {/* ── 1. Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-sora">
            Équipe interne
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Gestion des administrateurs et modérateurs Certilys.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            id="btn-invite-team-member"
            size="sm"
            className="gap-2"
            onClick={() => setInviteOpen(true)}
            aria-label="Inviter un nouveau membre d'équipe"
          >
            <HugeiconsIcon icon={MailSendIcon} className="size-4" size={16} strokeWidth={1.5} />
            <span>Inviter un membre</span>
          </Button>
        </div>
      </div>

      {/* ── 2. KPI compacts ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI Admins */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <HugeiconsIcon icon={UserStar01Icon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.adminsCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Administrateurs</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI Modérateurs */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <HugeiconsIcon icon={UserGroupIcon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.moderatorsCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Modérateurs</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI Invitations en attente */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <HugeiconsIcon icon={MailSendIcon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.pendingInvitations}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Invitations en attente</p>
            </div>
          </CardContent>
        </Card>

        {/* KPI Comptes suspendus */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <HugeiconsIcon icon={UserBlock01Icon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.suspendedCount}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Comptes suspendus</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Recherche + Filtres ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <SearchFilter
          placeholder="Rechercher par nom ou email…"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filters}
          filterValues={filterValues}
          onFiltersApply={setFilterValues}
          onFiltersReset={() => setFilterValues({ role: "", status: "", twoFactor: "" })}
          sheetTitle="Filtrer l'équipe interne"
          className="w-full max-w-sm"
        />
        {activeFilterCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {filteredData.length} membre{filteredData.length > 1 ? "s" : ""} trouvé{filteredData.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {actionError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      {/* ── 4. Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="min-w-[200px]">Membre</TableHead>
              <TableHead className="min-w-[220px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Rôle</TableHead>
              <TableHead className="min-w-[110px]">Statut</TableHead>
              <TableHead className="min-w-[80px] text-center">2FA</TableHead>
              <TableHead className="min-w-[160px]">Dernière connexion</TableHead>
              <TableHead className="min-w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-8 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="size-4 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-36 ml-auto" /></TableCell>
                </TableRow>
              ))}

            {!loading && filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <HugeiconsIcon icon={searchValue ? SearchRemoveIcon : InboxIcon} className="size-6 text-muted-foreground" size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {searchValue ? "Aucun résultat" : "Aucun membre d'équipe"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {searchValue ? "Modifiez vos filtres ou termes de recherche." : "Invitez des collaborateurs pour administrer le back-office."}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredData.map((member) => {
                const isActive = member.status === "ACTIVE";
                const isSuspended = member.status === "SUSPENDED";
                const isInvited = member.status === "INVITED";
                const isPending = actionPending === member.id;

                return (
                  <TableRow key={member.id} className="group hover:bg-muted/30 transition-colors">
                    {/* Membre */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="size-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <HugeiconsIcon icon={UserIcon} className="size-3.5" size={14} strokeWidth={1.5} />
                          </div>
                        )}
                        <span className="text-sm font-medium text-foreground leading-none">{member.name}</span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-sm text-foreground/80">{member.email}</TableCell>

                    {/* Rôle */}
                    <TableCell>
                      <RoleBadge role={member.role} />
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      <StatusBadge status={member.status} />
                    </TableCell>

                    {/* 2FA */}
                    <TableCell className="text-center">
                      <BoolIndicator value={member.twoFactorEnabled} />
                    </TableCell>

                    {/* Dernière connexion */}
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(member.lastLoginAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setProfileMember(member);
                            setProfileOpen(true);
                          }}
                        >
                          <HugeiconsIcon icon={EyeIcon} className="size-3.5" size={14} strokeWidth={1.5} />
                          <span>Profil</span>
                        </Button>

                        {isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                            disabled={isPending}
                            onClick={() => triggerConfirm("suspend", member)}
                          >
                            <HugeiconsIcon icon={UserBlock01Icon} className="size-3.5" size={14} strokeWidth={1.5} />
                            <span>Suspendre</span>
                          </Button>
                        )}

                        {isSuspended && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            disabled={isPending}
                            onClick={() => triggerConfirm("reactivate", member)}
                          >
                            <HugeiconsIcon icon={UserCheck01Icon} className="size-3.5" size={14} strokeWidth={1.5} />
                            <span>Réactiver</span>
                          </Button>
                        )}

                        {isInvited && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-500/10"
                            disabled={isPending}
                            onClick={() => triggerConfirm("resend", member)}
                          >
                            <HugeiconsIcon icon={MailSendIcon} className="size-3.5" size={14} strokeWidth={1.5} />
                            <span>Renvoyer</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* ── 5. Dialog: Invitation Membre ───────────────────────────────────── */}
      <AppDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        size="md"
        title="Inviter un collaborateur interne"
        description="Invitez un administrateur ou modérateur à rejoindre l’équipe Certilys."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteOpen(false)}
              disabled={actionPending === "invite"}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="team-invite-form"
              disabled={actionPending === "invite"}
              className="w-full gap-2 sm:w-auto"
            >
              {actionPending === "invite" && (
                <HugeiconsIcon icon={Loading02Icon} className="size-4 animate-spin" size={16} strokeWidth={1.5} />
              )}
              <span>Envoyer l&apos;invitation</span>
            </Button>
          </div>
        }
      >
        <form id="team-invite-form" onSubmit={handleInviteSubmit} className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Un e-mail d&apos;invitation avec un lien de configuration de mot de passe unique lui sera envoyé.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Nom complet</Label>
            <Input
              id="invite-name"
              placeholder="Ex. Jean Dupont"
              required
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Adresse email professionnelle</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="nom@certilys.fr"
              required
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Rôle d&apos;accès</Label>
            <Select
              value={newMember.role}
              onValueChange={(val: TeamRole) => setNewMember({ ...newMember, role: val })}
            >
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrateur (Contrôle total du back-office)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </AppDialog>

      {/* ── 6. Dialog: Confirmation d'action sensible ────────────────────────── */}
      {confirmType ? (
        <DecisionDialog
          open={confirmOpen}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) {
              setTargetMember(null);
              setConfirmType(null);
            }
          }}
          title={
            confirmType === "suspend"
              ? "Suspendre le compte"
              : confirmType === "reactivate"
                ? "Réactiver le compte"
                : "Renvoyer l'invitation"
          }
          description={
            confirmType === "suspend"
              ? "Le collaborateur perdra immédiatement tous ses accès au back-office Certilys."
              : confirmType === "reactivate"
                ? "Ses accès initiaux seront immédiatement rétablis."
                : "Le lien précédent sera expiré et un nouveau mail de configuration sera envoyé."
          }
          tone={confirmType === "suspend" ? "danger" : "info"}
          profile={
            targetMember
              ? {
                  name: targetMember.name,
                  email: targetMember.email,
                  avatarUrl: targetMember.avatarUrl,
                  status: targetMember.status,
                }
              : undefined
          }
          confirmLabel="Confirmer"
          cancelLabel="Annuler"
          loading={targetMember ? actionPending === targetMember.id : false}
          onConfirm={() => {
            if (confirmType === "suspend") handleSuspendConfirm();
            if (confirmType === "reactivate") handleReactivateConfirm();
            if (confirmType === "resend") handleResendConfirm();
          }}
        />
      ) : null}

      {/* ── 7. Dialog: Détails Profil (Voir Profil) ─────────────────────────── */}
      <InternalProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={
          profileMember
            ? {
                name: profileMember.name,
                email: profileMember.email,
                avatarUrl: profileMember.avatarUrl,
                status: profileMember.status,
                role: profileMember.role === "ADMIN" ? "Administrateur" : "Modérateur",
                accountStatus: profileMember.status === "ACTIVE" ? "Actif" : profileMember.status === "SUSPENDED" ? "Suspendu" : "Invitation en attente",
                twoFactorEnabled: profileMember.twoFactorEnabled,
                lastLogin: formatDateTime(profileMember.lastLoginAt),
              }
            : null
        }
      />
    </div>
  );
}

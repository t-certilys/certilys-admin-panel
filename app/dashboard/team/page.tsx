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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InternalProfileDialog } from "@/components/certilys-ui/dialogs";

import {
  type TeamMember,
  type TeamRole,
  type TeamMemberStatus,
  mockTeamMembers,
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

export default function TeamPage() {
  // ── États locaux
  const [searchValue, setSearchValue] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({
    role: "",
    status: "",
    twoFactor: "",
  });

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<TeamMember[]>(mockTeamMembers);
  const [actionPending, setActionPending] = React.useState<string | null>(null);

  // États pour les Dialogs
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [newMember, setNewMember] = React.useState({ name: "", email: "", role: "MODERATOR" as TeamRole });

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState<"suspend" | "reactivate" | "resend" | null>(null);
  const [targetMember, setTargetMember] = React.useState<TeamMember | null>(null);

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [profileMember, setProfileMember] = React.useState<TeamMember | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const kpis = React.useMemo(() => getTeamKpis(data), [data]);

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

  // ── Actions de simulation (endpoints préparés)
  // GET /admin/team est représenté par l'affichage initial
  // POST /admin/team/invitations
  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    setActionPending("invite");
    await new Promise((r) => setTimeout(r, 800));

    const invited: TeamMember = {
      id: `tm_${Date.now()}`,
      name: newMember.name,
      email: newMember.email.toLowerCase(),
      role: newMember.role,
      status: "INVITED",
      twoFactorEnabled: false,
      lastLoginAt: null,
    };

    setData((prev) => [invited, ...prev]);
    console.log("[ENDPOINT API MOCK] POST /admin/team/invitations SUCCESS", invited);

    setNewMember({ name: "", email: "", role: "MODERATOR" });
    setInviteOpen(false);
    setActionPending(null);
  }

  // POST /admin/team/:id/suspend
  async function handleSuspendConfirm() {
    if (!targetMember) return;
    setActionPending(targetMember.id);
    setConfirmOpen(false);

    await new Promise((r) => setTimeout(r, 700));

    setData((prev) =>
      prev.map((m) => (m.id === targetMember.id ? { ...m, status: "SUSPENDED" as TeamMemberStatus } : m))
    );
    console.log(`[ENDPOINT API MOCK] POST /admin/team/${targetMember.id}/suspend SUCCESS`);

    setActionPending(null);
    setTargetMember(null);
    setConfirmType(null);
  }

  // POST /admin/team/:id/reactivate
  async function handleReactivateConfirm() {
    if (!targetMember) return;
    setActionPending(targetMember.id);
    setConfirmOpen(false);

    await new Promise((r) => setTimeout(r, 700));

    setData((prev) =>
      prev.map((m) => (m.id === targetMember.id ? { ...m, status: "ACTIVE" as TeamMemberStatus } : m))
    );
    console.log(`[ENDPOINT API MOCK] POST /admin/team/${targetMember.id}/reactivate SUCCESS`);

    setActionPending(null);
    setTargetMember(null);
    setConfirmType(null);
  }

  // Renvoyer invitation (MOCK API)
  async function handleResendConfirm() {
    if (!targetMember) return;
    setActionPending(targetMember.id);
    setConfirmOpen(false);

    await new Promise((r) => setTimeout(r, 800));
    console.log(`[ENDPOINT API MOCK] POST /admin/team/invitations/resend TO ${targetMember.email} SUCCESS`);

    setActionPending(null);
    setTargetMember(null);
    setConfirmType(null);
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
            <SelectItem value="MODERATOR">Modérateur</SelectItem>
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
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="w-[min(calc(100vw-2rem),40rem)] max-h-[min(650px,calc(100dvh-2rem))] overflow-hidden rounded-2xl p-0 flex flex-col">
          <DialogHeader className="px-6 py-5 border-b shrink-0 text-left">
            <DialogTitle className="text-lg font-semibold text-foreground font-sora">
              Inviter un collaborateur interne
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleInviteSubmit} className="flex-1 min-h-0 flex flex-col">
            <div className="px-6 py-6 overflow-y-auto flex-1 space-y-4">
              <p className="text-xs text-muted-foreground">
                Invitez un administrateur ou modérateur à rejoindre l&apos;équipe Certilys. Un e-mail d&apos;invitation avec un lien de configuration de mot de passe unique lui sera envoyé.
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
                    <SelectItem value="MODERATOR">Modérateur (Gestion opérationnelle courante)</SelectItem>
                    <SelectItem value="ADMIN">Administrateur (Contrôle total du back-office)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-muted/20 shrink-0 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setInviteOpen(false)}
                disabled={actionPending === "invite"}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={actionPending === "invite"}
                className="gap-2"
              >
                {actionPending === "invite" && (
                  <HugeiconsIcon icon={Loading02Icon} className="size-4 animate-spin" size={16} strokeWidth={1.5} />
                )}
                <span>Envoyer l&apos;invitation</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── 6. Dialog: Confirmation d'action sensible ────────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[min(calc(100vw-2rem),30rem)] overflow-hidden rounded-2xl p-0 flex flex-col">
          <DialogHeader className="px-6 py-5 border-b shrink-0 text-left">
            <DialogTitle className="text-lg font-semibold text-foreground font-sora">
              {confirmType === "suspend" && "Suspendre le compte"}
              {confirmType === "reactivate" && "Réactiver le compte"}
              {confirmType === "resend" && "Renvoyer l'invitation"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-6 space-y-3">
            {confirmType === "suspend" && (
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir suspendre le compte de <strong className="text-foreground">{targetMember?.name}</strong> ?
                Celui-ci perdra immédiatement tous ses accès au back-office Certilys.
              </p>
            )}
            {confirmType === "reactivate" && (
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir réactiver le compte de <strong className="text-foreground">{targetMember?.name}</strong> ?
                Ses accès initiaux de {targetMember?.role === "ADMIN" ? "Administrateur" : "Modérateur"} seront immédiatement rétablis.
              </p>
            )}
            {confirmType === "resend" && (
              <p className="text-sm text-muted-foreground">
                Renvoyer le lien d&apos;invitation par e-mail à <strong className="text-foreground">{targetMember?.email}</strong> ?
                Le lien précédent sera expiré et un nouveau mail de configuration sera envoyé.
              </p>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20 shrink-0 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfirmOpen(false);
                setTargetMember(null);
                setConfirmType(null);
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              variant={confirmType === "suspend" ? "destructive" : "default"}
              onClick={() => {
                if (confirmType === "suspend") handleSuspendConfirm();
                if (confirmType === "reactivate") handleReactivateConfirm();
                if (confirmType === "resend") handleResendConfirm();
              }}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

"use client";

import * as React from "react";
import {
  ArrowLeft01Icon,
  Loading02Icon,
  Search01Icon,
  UserCheck01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import { DecisionDialog } from "@/components/certilys-ui/dialogs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  designateTesterAction,
  getAdminUsersAction,
  revokeTesterAction,
} from "@/lib/admin-users-actions";
import type { AdminUser } from "@/lib/mock/admin-users-data";

type TesterAction = "designate" | "revoke";

type TesterDialogState = {
  user: AdminUser | null;
  action: TesterAction | null;
  loading: boolean;
  error: string | null;
};

export function TesterManagementPage({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialog, setDialog] = React.useState<TesterDialogState>({
    user: null,
    action: null,
    loading: false,
    error: null,
  });

  const loadLearners = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminUsersAction({ role: "LEARNER" });
      setUsers(response.users);
    } catch {
      setError("Impossible de charger les apprenants.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLearners();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadLearners]);

  const filteredUsers = users.filter((user) => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return true;
    return `${user.fullName} ${user.email}`.toLowerCase().includes(normalizedSearch);
  });

  const openDialog = (user: AdminUser, action: TesterAction) => {
    setDialog({ user, action, loading: false, error: null });
  };

  const closeDialog = (open: boolean) => {
    if (!open && !dialog.loading) {
      setDialog({ user: null, action: null, loading: false, error: null });
    }
  };

  const confirmAction = async () => {
    if (!dialog.user || !dialog.action) return;
    setDialog((current) => ({ ...current, loading: true, error: null }));

    try {
      const updatedUser =
        dialog.action === "designate"
          ? await designateTesterAction(dialog.user.id)
          : await revokeTesterAction(dialog.user.id);
      setUsers((current) =>
        current.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
        ),
      );
      toast.success(
        dialog.action === "designate"
          ? "Apprenant désigné comme testeur."
          : "Statut testeur retiré.",
      );
      closeDialog(false);
    } catch {
      setDialog((current) => ({
        ...current,
        loading: false,
        error: "La mise à jour n’a pas pu être enregistrée.",
      }));
    }
  };

  const selectedUser = dialog.user;
  const isDesignation = dialog.action === "designate";

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <Button type="button" variant="ghost" className="-ml-2 w-fit gap-2" onClick={onBack}>
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        Retour aux configurations
      </Button>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-border/70 bg-emerald-500/10 text-emerald-700">
            <HugeiconsIcon icon={UserMultiple02Icon} className="size-5" />
          </span>
          <div>
            <h1 className="font-sora text-2xl font-semibold tracking-tight text-foreground">
              Comptes testeurs
            </h1>
            <p className="text-sm text-muted-foreground">
              Désignez les apprenants qui peuvent explorer les formations masquées du catalogue.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Apprenants</CardTitle>
            <CardDescription>
              {users.filter((user) => user.isTester).length} testeur(s) désigné(s)
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un apprenant"
              aria-label="Rechercher un apprenant"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Loading02Icon} className="size-4 animate-spin" />
              Chargement des apprenants…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" variant="outline" onClick={() => void loadLearners()}>
                Réessayer
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-muted-foreground">
              Aucun apprenant ne correspond à cette recherche.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{user.fullName}</p>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    {user.isTester ? (
                      <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                        <HugeiconsIcon icon={UserCheck01Icon} className="size-3.5" />
                        Testeur
                      </Badge>
                    ) : (
                      <Badge variant="outline">Apprenant</Badge>
                    )}
                    <Button
                      type="button"
                      variant={user.isTester ? "outline" : "default"}
                      size="sm"
                      onClick={() => openDialog(user, user.isTester ? "revoke" : "designate")}
                    >
                      {user.isTester ? "Retirer" : "Désigner"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DecisionDialog
        open={Boolean(selectedUser && dialog.action)}
        onOpenChange={closeDialog}
        title={isDesignation ? "Désigner comme testeur" : "Retirer le statut testeur"}
        description={
          isDesignation
            ? `${selectedUser?.fullName ?? "Cet apprenant"} pourra voir les formations des formateurs masqués.`
            : `${selectedUser?.fullName ?? "Cet apprenant"} ne verra plus les formations réservées aux testeurs.`
        }
        tone={isDesignation ? "success" : "warning"}
        confirmLabel={isDesignation ? "Désigner" : "Retirer le statut"}
        cancelLabel="Annuler"
        loading={dialog.loading}
        error={dialog.error}
        onConfirm={confirmAction}
      />
    </div>
  );
}

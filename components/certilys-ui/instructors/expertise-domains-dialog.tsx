"use client";

import * as React from "react";
import {
  Alert01Icon,
  Cancel01Icon,
  Delete02Icon,
  Edit02Icon,
  Loading02Icon,
  PlusSignIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { AppDialog } from "@/components/certilys-ui/dialogs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminExpertiseDomainAction,
  deleteAdminExpertiseDomainAction,
  getAdminExpertiseDomainsAction,
  type AdminExpertiseDomain,
  updateAdminExpertiseDomainAction,
} from "@/lib/admin-expertise-domains-actions";

type ExpertiseDomainsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDomainsChange?: (domains: AdminExpertiseDomain[]) => void;
};

export function ExpertiseDomainsDialog({
  open,
  onOpenChange,
  onDomainsChange,
}: ExpertiseDomainsDialogProps) {
  const [domains, setDomains] = React.useState<AdminExpertiseDomain[]>([]);
  const [newName, setNewName] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [deleteTarget, setDeleteTarget] =
    React.useState<AdminExpertiseDomain | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const publishDomains = React.useCallback(
    (nextDomains: AdminExpertiseDomain[]) => {
      setDomains(nextDomains);
      onDomainsChange?.(nextDomains);
    },
    [onDomainsChange],
  );

  React.useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    getAdminExpertiseDomainsAction()
      .then((items) => {
        if (active) publishDomains(items);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les domaines d’expertise.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, publishDomains]);

  async function createDomain() {
    const name = newName.trim();
    if (name.length < 2 || saving) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createAdminExpertiseDomainAction(name);
      publishDomains([...domains, created]);
      setNewName("");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Impossible de créer ce domaine.",
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditing(domain: AdminExpertiseDomain) {
    setEditingId(domain.id);
    setEditingName(domain.name);
    setError(null);
  }

  async function saveDomain(domain: AdminExpertiseDomain) {
    const name = editingName.trim();
    if (name.length < 2 || name === domain.name || saving) {
      if (name === domain.name) setEditingId(null);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAdminExpertiseDomainAction(domain.id, name);
      publishDomains(
        domains.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditingId(null);
      setEditingName("");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Impossible de modifier ce domaine.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAdminExpertiseDomainAction(deleteTarget.id);
      publishDomains(domains.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (actionError) {
      setDeleteTarget(null);
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Impossible de supprimer ce domaine.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AppDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!saving && !deleting) onOpenChange(nextOpen);
        }}
        size="lg"
        title="Domaines d’expertise"
        description="Gérez les choix proposés aux formateurs pendant leur onboarding."
        footer={
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving || deleting}
            >
              Fermer
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <Label htmlFor="new-expertise-domain">Nouveau domaine</Label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input
                id="new-expertise-domain"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void createDomain();
                  }
                }}
                placeholder="Ex. : Architecture logicielle"
                maxLength={120}
                disabled={saving}
              />
              <Button
                onClick={() => void createDomain()}
                disabled={newName.trim().length < 2 || saving}
                className="gap-2 sm:min-w-28"
              >
                {saving && !editingId ? (
                  <HugeiconsIcon icon={Loading02Icon} className="size-4 animate-spin" />
                ) : (
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                )}
                Ajouter
              </Button>
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              <HugeiconsIcon icon={Alert01Icon} className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="space-y-2" aria-live="polite">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <HugeiconsIcon icon={Loading02Icon} className="size-4 animate-spin" />
                Chargement des domaines…
              </div>
            ) : domains.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Aucun domaine n’est encore disponible.
              </div>
            ) : (
              domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 px-3 py-3 transition-colors hover:border-primary/25 sm:flex-row sm:items-center"
                >
                  {editingId === domain.id ? (
                    <Input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void saveDomain(domain);
                        if (event.key === "Escape") setEditingId(null);
                      }}
                      maxLength={120}
                      autoFocus
                      disabled={saving}
                      aria-label={`Modifier ${domain.name}`}
                    />
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {domain.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {domain.slug}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <Badge variant="outline" className="font-normal">
                      {domain.usageCount} formateur
                      {domain.usageCount > 1 ? "s" : ""}
                    </Badge>
                    {editingId === domain.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                          aria-label="Annuler la modification"
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          onClick={() => void saveDomain(domain)}
                          disabled={editingName.trim().length < 2 || saving}
                          aria-label="Enregistrer la modification"
                        >
                          <HugeiconsIcon
                            icon={saving ? Loading02Icon : Tick02Icon}
                            className={`size-4 ${saving ? "animate-spin" : ""}`}
                          />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEditing(domain)}
                          aria-label={`Modifier ${domain.name}`}
                        >
                          <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTarget(domain)}
                          disabled={domain.usageCount > 0}
                          title={
                            domain.usageCount > 0
                              ? "Ce domaine est utilisé par un formateur."
                              : "Supprimer ce domaine"
                          }
                          aria-label={`Supprimer ${domain.name}`}
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </AppDialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce domaine ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {deleteTarget?.name} » ne sera plus proposé aux nouveaux
              formateurs. Cette action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

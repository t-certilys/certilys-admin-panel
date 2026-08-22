"use client";

import * as React from "react";
import {
  Alert01Icon,
  Delete02Icon,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminLeonoCreditPackAction,
  deleteAdminLeonoCreditPackAction,
  getAdminLeonoCreditPacksAction,
  type AdminLeonoCreditPack,
  updateAdminLeonoCreditPackAction,
} from "@/lib/admin-leono-credit-packs-actions";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };
type Draft = Pick<AdminLeonoCreditPack, "label" | "credits" | "amount" | "isActive" | "recommended">;

const EMPTY_DRAFT: Draft = {
  label: "",
  credits: 500,
  amount: 2500,
  isActive: true,
  recommended: false,
};

export function LeonoCreditPacksDialog({ open, onOpenChange }: Props) {
  const [packs, setPacks] = React.useState<AdminLeonoCreditPack[]>([]);
  const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
  const [edits, setEdits] = React.useState<Record<string, Draft>>({});
  const [deleteTarget, setDeleteTarget] = React.useState<AdminLeonoCreditPack | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminLeonoCreditPacksAction();
      setPacks(result);
      setEdits(Object.fromEntries(result.map((pack) => [pack.id, toDraft(pack)])));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de charger les packs Léono.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) void load();
  }, [load, open]);

  async function createPack() {
    if (!valid(draft) || busyId) return;
    setBusyId("new");
    setError(null);
    try {
      await createAdminLeonoCreditPackAction({
        label: draft.label.trim(), credits: draft.credits, amount: draft.amount,
        isActive: draft.isActive, isRecommended: draft.recommended,
      });
      setDraft(EMPTY_DRAFT);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de créer ce pack.");
    } finally {
      setBusyId(null);
    }
  }

  async function savePack(pack: AdminLeonoCreditPack) {
    const next = edits[pack.id];
    if (!next || !valid(next) || busyId) return;
    setBusyId(pack.id);
    setError(null);
    try {
      await updateAdminLeonoCreditPackAction(pack.id, {
        label: next.label.trim(), credits: next.credits, amount: next.amount,
        isActive: next.isActive, isRecommended: next.recommended,
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de modifier ce pack.");
    } finally {
      setBusyId(null);
    }
  }

  async function removePack() {
    if (!deleteTarget || busyId) return;
    setBusyId(deleteTarget.id);
    setError(null);
    try {
      await deleteAdminLeonoCreditPackAction(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (cause) {
      setDeleteTarget(null);
      setError(cause instanceof Error ? cause.message : "Impossible de supprimer ce pack.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AppDialog
        open={open}
        onOpenChange={(next) => { if (!busyId) onOpenChange(next); }}
        size="xl"
        title="Packs Léono"
        description="Gérez les crédits proposés aux apprenants et aux formateurs. Les montants sont exprimés en XOF."
        footer={<Button variant="outline" onClick={() => onOpenChange(false)} disabled={Boolean(busyId)}>Fermer</Button>}
      >
        <div className="space-y-5">
          <section className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="mb-3 text-sm font-medium">Nouveau pack</p>
            <PackFields value={draft} onChange={setDraft} id="new" />
            <div className="mt-3 flex justify-end">
              <Button size="sm" className="gap-2" disabled={!valid(draft) || Boolean(busyId)} onClick={() => void createPack()}>
                <HugeiconsIcon icon={busyId === "new" ? Loading02Icon : PlusSignIcon} className={`size-4 ${busyId === "new" ? "animate-spin" : ""}`} />
                Ajouter
              </Button>
            </div>
          </section>

          {error ? <div className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"><HugeiconsIcon icon={Alert01Icon} className="size-4 shrink-0" />{error}</div> : null}

          <div className="space-y-3" aria-live="polite">
            {loading && packs.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">Chargement des packs…</p> : null}
            {!loading && packs.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun pack disponible.</p> : null}
            {packs.map((pack) => {
              const value = edits[pack.id] ?? toDraft(pack);
              return (
                <section key={pack.id} className="rounded-xl border border-border/60 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{pack.label}</span>
                      {pack.recommended ? <Badge>Recommandé</Badge> : null}
                      {!pack.isActive ? <Badge variant="outline">Inactif</Badge> : null}
                    </div>
                    <Badge variant="outline" className="font-normal">{pack.purchaseCount} achat{pack.purchaseCount > 1 ? "s" : ""}</Badge>
                  </div>
                  <PackFields value={value} onChange={(next) => setEdits((current) => ({ ...current, [pack.id]: next }))} id={pack.id} />
                  <div className="mt-3 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(pack)} disabled={Boolean(busyId)}>
                      <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                      {pack.purchaseCount > 0 ? "Désactiver" : "Supprimer"}
                    </Button>
                    <Button size="sm" className="gap-2" onClick={() => void savePack(pack)} disabled={!valid(value) || Boolean(busyId)}>
                      <HugeiconsIcon icon={busyId === pack.id ? Loading02Icon : Tick02Icon} className={`size-4 ${busyId === pack.id ? "animate-spin" : ""}`} />
                      Enregistrer
                    </Button>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </AppDialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(next) => { if (!next && !busyId) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTarget?.purchaseCount ? "Désactiver ce pack ?" : "Supprimer ce pack ?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.purchaseCount ? "Ce pack a déjà été acheté : il sera conservé dans l’historique et retiré du catalogue." : "Ce pack n’a jamais été acheté et sera supprimé définitivement."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(busyId)}>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={Boolean(busyId)} onClick={(event) => { event.preventDefault(); void removePack(); }}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PackFields({ value, onChange, id }: { value: Draft; onChange: (value: Draft) => void; id: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div><Label htmlFor={`${id}-label`}>Libellé</Label><Input id={`${id}-label`} className="mt-1.5" value={value.label} maxLength={60} onChange={(event) => onChange({ ...value, label: event.target.value })} /></div>
      <div><Label htmlFor={`${id}-credits`}>Crédits</Label><Input id={`${id}-credits`} className="mt-1.5" type="number" min={1} value={value.credits} onChange={(event) => onChange({ ...value, credits: Number(event.target.value) })} /></div>
      <div><Label htmlFor={`${id}-amount`}>Montant XOF</Label><Input id={`${id}-amount`} className="mt-1.5" type="number" min={1} value={value.amount} onChange={(event) => onChange({ ...value, amount: Number(event.target.value) })} /></div>
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={value.isActive} onCheckedChange={(checked) => onChange({ ...value, isActive: checked === true })} />Actif</label>
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={value.recommended} onCheckedChange={(checked) => onChange({ ...value, recommended: checked === true })} />Recommandé</label>
    </div>
  );
}

function toDraft(pack: AdminLeonoCreditPack): Draft {
  return { label: pack.label, credits: pack.credits, amount: pack.amount, isActive: pack.isActive, recommended: pack.recommended };
}

function valid(value: Draft) {
  return value.label.trim().length >= 2 && Number.isInteger(value.credits) && value.credits > 0 && Number.isInteger(value.amount) && value.amount > 0;
}

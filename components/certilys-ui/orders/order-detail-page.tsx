"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft01Icon,
  Alert01Icon,
  AlertCircleIcon,
  UserIcon,
  Book01Icon,
  Clock01Icon,
  GlobeIcon,
  Tag01Icon,
  Layout01Icon,
  LockKeyIcon,
  InvoiceIcon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { DecisionDialog } from "@/components/certilys-ui/dialogs";

import {
  type AdminOrder,
  orderStatusConfig,
  paymentStatusConfig,
  accessStatusConfig,
  formatXOF,
  formatDate,
} from "@/lib/mock/admin-orders-data";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ActionType = "sync-payment" | "mark-review" | "revoke-access" | "refund";

interface ActionDialogState {
  open: boolean;
  type: ActionType | null;
  reason: string;
  loading: boolean;
  error: string | null;
}

const ACTION_CONFIG: Record<
  ActionType,
  {
    label: string;
    description: string;
    confirmLabel: string;
    requiresReason: boolean;
    reasonLabel: string;
    reasonPlaceholder: string;
    variant: "default" | "destructive";
    auditEvent: "PAYMENT_SYNC_REQUESTED" | "ORDER_MARKED_FOR_REVIEW" | "ACCESS_REVOKED" | "ORDER_REFUNDED";
    icon: IconSvgElement;
  }
> = {
  "sync-payment": {
    label: "Synchroniser le paiement Moneroo",
    description:
      "Cette action interroge la passerelle Moneroo pour mettre à jour le statut du paiement. Si le paiement est COMPLETED, l'accès apprenant sera automatiquement activé.",
    confirmLabel: "Synchroniser",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    variant: "default",
    auditEvent: "PAYMENT_SYNC_REQUESTED",
    icon: Clock01Icon,
  },
  "mark-review": {
    label: "Signaler la commande pour vérification",
    description:
      "Cette action marque la commande pour examen manuel par l'équipe financière. Une alerte sera enregistrée dans les logs d'audit.",
    confirmLabel: "Marquer à vérifier",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    variant: "default",
    auditEvent: "ORDER_MARKED_FOR_REVIEW",
    icon: Alert01Icon,
  },
  "revoke-access": {
    label: "Révoquer l'accès à la formation",
    description:
      "L'accès de l'apprenant à la formation sera immédiatement suspendu. Un motif de révocation doit être spécifié et sera communiqué à l'intéressé.",
    confirmLabel: "Révoquer l'accès",
    requiresReason: true,
    reasonLabel: "Motif de la révocation (obligatoire)",
    reasonPlaceholder: "Expliquez précisément la raison de la révocation de l'accès (min 10 caractères)…",
    variant: "destructive",
    auditEvent: "ACCESS_REVOKED",
    icon: LockKeyIcon,
  },
  refund: {
    label: "Marquer la commande comme remboursée",
    description:
      "Le remboursement de l'argent doit déjà avoir été effectué manuellement sur la passerelle (Paygride / Moneroo). Cette action ne déplace AUCUN argent : elle enregistre le remboursement (commande et paiement en « Remboursée »), révoque l'accès de l'apprenant, et déduit la part du formateur de son solde.",
    confirmLabel: "Confirmer le remboursement",
    requiresReason: true,
    reasonLabel: "Motif du remboursement (obligatoire)",
    reasonPlaceholder:
      "Ex. demande client sous 24h, doublon de paiement… (min 10 caractères)",
    variant: "destructive",
    auditEvent: "ORDER_REFUNDED",
    icon: Coins01Icon,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Simulation API
// ─────────────────────────────────────────────────────────────────────────────

async function simulateApiCall(
  type: ActionType,
  id: string,
  reason?: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 1200));

  if (Math.random() < 0.02) {
    throw new Error("Erreur de connexion avec le serveur. Veuillez réessayer.");
  }

  const endpointMap: Record<ActionType, string> = {
    "sync-payment": "sync-payment",
    "mark-review": "mark-for-review",
    "revoke-access": "revoke-access",
    refund: "refund",
  };

  const endpoint = `/admin/orders/${id}/${endpointMap[type]}`;
  console.log(`[AUDIT] ${ACTION_CONFIG[type].auditEvent}`, {
    orderId: id,
    reason,
    endpoint,
    timestamp: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Page de Détail
// ─────────────────────────────────────────────────────────────────────────────

type OrderDetailPageProps = {
  initialOrder: AdminOrder | null;
};

export default function OrderDetailPage({
  initialOrder,
}: OrderDetailPageProps) {
  const [order, setOrder] = React.useState<AdminOrder | null>(initialOrder);

  // Dialog d'action
  const [dialog, setDialog] = React.useState<ActionDialogState>({
    open: false,
    type: null,
    reason: "",
    loading: false,
    error: null,
  });

  function openAction(type: ActionType) {
    setDialog({ open: true, type, reason: "", loading: false, error: null });
  }

  function closeDialog() {
    if (dialog.loading) return;
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleConfirm(reasonOverride?: string) {
    if (!dialog.type || !order) return;
    const reason = reasonOverride ?? dialog.reason;
    setDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await simulateApiCall(dialog.type, order.id, reason);

      // Appliquer les changements sur l'état local pour retour immédiat et réactif
      setOrder((prev) => {
        if (!prev) return null;
        const updated = { ...prev, updatedAt: new Date().toISOString() };

        if (dialog.type === "revoke-access") {
          updated.accessStatus = "REVOKED";
          updated.access = {
            ...prev.access,
            revokedAt: new Date().toISOString(),
            revocationReason: reason,
          };
          updated.events = [
            {
              title: "Accès révoqué",
              date: new Date().toISOString(),
              description: `L'accès à la formation a été révoqué manuellement par l'administrateur. Motif : ${reason}`,
            },
            ...prev.events,
          ];
        } else if (dialog.type === "sync-payment") {
          // Si la commande simulait une anomalie (ex: ORD-2026-0407, paiement complet mais access non créé),
          // on synchronise en créant l'accès actif.
          if (prev.paymentStatus === "COMPLETED" && prev.accessStatus === "NOT_CREATED") {
            updated.accessStatus = "ACTIVE";
            updated.access = {
              ...prev.access,
              enrollmentId: `enr-${Math.floor(100000 + Math.random() * 900000)}`,
              progressPercent: 0,
              createdAt: new Date().toISOString(),
            };
            updated.events = [
              {
                title: "Accès synchronisé et activé",
                date: new Date().toISOString(),
                description: "Suite à la synchronisation Moneroo, l'enrôlement actif a été provisionné.",
              },
              ...prev.events,
            ];
          } else {
            updated.events = [
              {
                title: "Paiement synchronisé",
                date: new Date().toISOString(),
                description: "Interrogation réussie de l'API Moneroo. Statut inchangé.",
              },
              ...prev.events,
            ];
          }
        } else if (dialog.type === "mark-review") {
          updated.events = [
            {
              title: "Signalement pour vérification",
              date: new Date().toISOString(),
              description: "Commande marquée pour examen manuel des équipes financières.",
            },
            ...prev.events,
          ];
        } else if (dialog.type === "refund") {
          updated.orderStatus = "REFUNDED";
          updated.paymentStatus = "REFUNDED";
          updated.accessStatus = "REVOKED";
          updated.paiement = {
            ...prev.paiement,
            refundedAt: new Date().toISOString(),
          };
          updated.access = {
            ...prev.access,
            revokedAt: new Date().toISOString(),
            revocationReason: `Remboursement : ${reason}`,
          };
          updated.events = [
            {
              title: "Commande remboursée",
              date: new Date().toISOString(),
              description: `Remboursement enregistré (effectué manuellement sur la passerelle). Accès révoqué et part formateur (${formatXOF(prev.netInstructorXOF)}) déduite de son solde. Motif : ${reason}`,
            },
            ...prev.events,
          ];
        }

        return updated;
      });

      setDialog((prev) => ({ ...prev, open: false, loading: false }));
    } catch (err) {
      setDialog((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Une erreur est survenue.",
      }));
    }
  }

  // Erreur de chargement
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 px-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className="size-7 text-destructive"
            size={28}
            strokeWidth={1.5}
          />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Commande introuvable
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ce numéro de commande n&apos;existe pas ou a été archivé.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/orders">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4 mr-2"
              size={16}
              strokeWidth={1.5}
            />
            Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  const payCfg = paymentStatusConfig[order.paymentStatus];
  const accCfg = accessStatusConfig[order.accessStatus];
  const ordCfg = orderStatusConfig[order.orderStatus];

  // Règle de sécurité : aucun accès ne peut être créé/activé si paymentStatus !== COMPLETED
  const isAccessDisabled = order.paymentStatus !== "COMPLETED";

  const dialogCfg = ACTION_CONFIG[dialog.type ?? "sync-payment"];

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
            <Link href="/dashboard/orders" id="btn-back-to-orders">
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="size-4"
                size={16}
                strokeWidth={1.5}
              />
              Commandes
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <span className="font-mono text-sm font-semibold text-foreground">
            {order.id}
          </span>
        </div>

        {/* Boutons d'actions sensibles */}
        <div className="flex items-center gap-2 flex-wrap">
          {(order.paymentStatus !== "COMPLETED" || order.accessStatus === "NOT_CREATED") && (
            <Button
              id="btn-detail-sync-payment"
              variant="outline"
              size="sm"
              className="gap-2 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => openAction("sync-payment")}
            >
              <HugeiconsIcon
                icon={Clock01Icon}
                className="size-4"
                size={16}
                strokeWidth={1.5}
              />
              Synchroniser paiement
            </Button>
          )}

          <Button
            id="btn-detail-mark-review"
            variant="outline"
            size="sm"
            className="gap-2 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
            onClick={() => openAction("mark-review")}
          >
            <HugeiconsIcon
              icon={Alert01Icon}
              className="size-4"
              size={16}
              strokeWidth={1.5}
            />
            Signaler
          </Button>

          {order.accessStatus === "ACTIVE" && (
            <Button
              id="btn-detail-revoke-access"
              variant="outline"
              size="sm"
              className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => openAction("revoke-access")}
            >
              <HugeiconsIcon
                icon={LockKeyIcon}
                className="size-4"
                size={16}
                strokeWidth={1.5}
              />
              Révoquer l&apos;accès
            </Button>
          )}

          {order.orderStatus === "PAID" &&
            order.paymentStatus === "COMPLETED" && (
              <Button
                id="btn-detail-refund"
                variant="outline"
                size="sm"
                className="gap-2 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                onClick={() => openAction("refund")}
              >
                <HugeiconsIcon
                  icon={Coins01Icon}
                  className="size-4"
                  size={16}
                  strokeWidth={1.5}
                />
                Marquer remboursé
              </Button>
            )}
        </div>
      </div>

      {/* ── Alertes Anomalie & Règle Métier ─────────────────────────────── */}
      {order.paymentStatus === "COMPLETED" && order.accessStatus === "NOT_CREATED" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3.5 text-sm">
          <HugeiconsIcon
            icon={Alert01Icon}
            className="size-5 shrink-0 mt-0.5 text-amber-500"
            size={20}
            strokeWidth={1.5}
          />
          <div className="space-y-1">
            <strong className="font-semibold block text-amber-700">
              Anomalie d&apos;inscription détectée
            </strong>
            <span className="text-muted-foreground text-xs block">
              Le paiement est complété, mais aucun accès actif n&apos;a été créé pour cet apprenant.
              Veuillez cliquer sur <strong>Synchroniser paiement</strong> ci-dessus pour provisionner son enrôlement.
            </span>
          </div>
        </div>
      )}

      {isAccessDisabled && order.accessStatus === "ACTIVE" && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5 text-sm text-destructive-foreground">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className="size-5 shrink-0 mt-0.5 text-destructive"
            size={20}
            strokeWidth={1.5}
          />
          <div className="space-y-1">
            <strong className="font-semibold block text-red-600">
              Violation de règle de sécurité d&apos;accès !
            </strong>
            <span className="text-muted-foreground text-xs block">
              Cette commande possède un statut de paiement <strong>{order.paymentStatus}</strong> mais a un accès marqué comme actif.
              Veuillez immédiatement révoquer l&apos;accès pédagogique de l&apos;apprenant.
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          1. RÉSUMÉ DE LA COMMANDE
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon
              icon={InvoiceIcon}
              className="size-4 text-primary shrink-0"
              size={16}
              strokeWidth={1.5}
            />
            1. Résumé de la commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            {/* Statuts */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Statuts commande / paiement
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`gap-1.5 px-2 py-0.5 text-[11px] font-medium ${ordCfg.colorClass}`}
                >
                  <span className={`size-1.5 rounded-full shrink-0 ${ordCfg.dotClass}`} />
                  Commande : {ordCfg.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={`gap-1.5 px-2 py-0.5 text-[11px] font-medium ${payCfg.colorClass}`}
                >
                  <span className={`size-1.5 rounded-full shrink-0 ${payCfg.dotClass}`} />
                  Paiement : {payCfg.label}
                </Badge>
              </div>
            </div>

            {/* Passerelle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Mode de paiement
              </span>
              <span className="text-sm font-medium text-foreground">
                {order.paiement.provider}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/80 truncate block">
                Session: {order.paiement.sessionId}
              </span>
            </div>

            {/* Dates */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                Horodatages clés
              </span>
              <span className="text-sm text-foreground">
                Créée le : {formatDate(order.createdAt)}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Modifiée le : {formatDate(order.updatedAt)}
              </span>
            </div>

            {/* Montants financiers */}
            <div className="flex flex-col gap-1.5 sm:text-right">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block">
                Achat financier net
              </span>
              <span className="text-lg font-bold text-foreground tabular-nums">
                {formatXOF(order.totalXOF)}
              </span>
              {order.discountXOF > 0 && (
                <span className="text-[10px] text-muted-foreground/80 line-through tabular-nums">
                  Brut: {formatXOF(order.amountXOF)} (-{formatXOF(order.discountXOF)})
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          2. APPRENANT & FORMATION & FACTURATION
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Apprenant */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              2. Apprenant (Client)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Nom complet</span>
              <span className="font-semibold text-foreground">{order.apprenant.name}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Adresse e-mail</span>
              <span className="text-foreground">{order.apprenant.email}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Téléphone</span>
              <span className="text-foreground tabular-nums">{order.apprenant.phone}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Localisation</span>
              <span className="text-foreground flex items-center gap-1">
                <HugeiconsIcon icon={GlobeIcon} className="size-3 text-muted-foreground" size={12} strokeWidth={1.5} />
                {order.apprenant.city}, {order.apprenant.country}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Formation */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Book01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              3. Formation souscrite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Titre de la formation</span>
              <span className="font-semibold text-foreground block max-w-full truncate" title={order.formation.title}>
                {order.formation.title}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Formateur</span>
              <span className="text-foreground">{order.formation.instructorName}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Prix d&apos;origine</span>
              <span className="text-foreground tabular-nums flex items-center gap-1">
                <HugeiconsIcon icon={Tag01Icon} className="size-3 text-muted-foreground" size={12} strokeWidth={1.5} />
                {formatXOF(order.formation.priceXOF)}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Statut formation</span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 px-1.5">
                {order.formation.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Facturation FIGÉE */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Layout01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              4. Facturation figée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Nom ou Raison Sociale</span>
              <span className="font-semibold text-foreground">{order.billingSnapshot.name}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Adresse de facturation</span>
              <span className="text-foreground leading-relaxed block max-w-full truncate" title={order.billingSnapshot.address}>
                {order.billingSnapshot.address}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Code Postal & Ville</span>
              <span className="text-foreground">
                {order.billingSnapshot.postalCode ? `${order.billingSnapshot.postalCode} ` : ""}{order.billingSnapshot.city}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium block">Identifiant Fiscal (NIF/TVA)</span>
              <span className="font-mono text-xs text-foreground bg-muted rounded px-1.5 py-0.5 w-fit block mt-0.5">
                {order.billingSnapshot.taxId ?? "Non spécifié"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          5. DETAILS PAIEMENT MONEROO & ACCES INSCRIPTION
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accès Inscription */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={LockKeyIcon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              6. Statut d&apos;accès & progression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">Statut d&apos;accès</span>
              <Badge
                variant="outline"
                className={`gap-1.5 px-2 py-0.5 text-xs font-semibold ${accCfg.colorClass}`}
              >
                <span className={`size-1.5 rounded-full shrink-0 ${accCfg.dotClass}`} />
                {accCfg.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">ID Inscription (Enrollment)</span>
                <span className="font-mono text-sm text-foreground block mt-0.5">
                  {order.access.enrollmentId ?? "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Progression pédagogique</span>
                <span className="font-medium text-foreground block mt-0.5 tabular-nums">
                  {order.access.progressPercent !== undefined ? `${order.access.progressPercent}%` : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Créé le</span>
                <span className="text-foreground text-xs block mt-0.5">
                  {order.access.createdAt ? formatDate(order.access.createdAt) : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Révoqué le</span>
                <span className="text-foreground text-xs block mt-0.5">
                  {order.access.revokedAt ? formatDate(order.access.revokedAt) : "-"}
                </span>
              </div>
            </div>

            {order.access.revocationReason && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-xs text-destructive mt-3">
                <strong className="font-semibold block mb-0.5">Motif de la révocation administrative :</strong>
                <span>{order.access.revocationReason}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commissions Financières */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Coins01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              7. Répartition de la commission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">Origine de la vente</span>
              <span className="font-medium text-foreground text-sm">
                {order.channel === "LINK"
                  ? "Lien du formateur"
                  : "Amené par Certilys"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">Taux de commission Certilys</span>
              <span className="font-bold text-foreground text-sm">{order.commissionRate}%</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-3">
                <span className="text-xs text-blue-600 font-medium block">Commission Certilys ({order.commissionRate}%)</span>
                <span className="text-lg font-bold text-blue-600 block mt-1 tabular-nums">
                  {formatXOF(order.commissionXOF)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Retenue à la source</span>
              </div>

              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                <span className="text-xs text-emerald-600 font-medium block">Net versé au Formateur ({100 - order.commissionRate}%)</span>
                <span className="text-lg font-bold text-emerald-600 block mt-1 tabular-nums">
                  {formatXOF(order.netInstructorXOF)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Part formateur liquidable</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          6. PAYLOAD DE PAIEMENT BRUT MONEROO (NON MODIFIABLE)
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Clock01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
            5. Détails paiement & Webhook Payload (Moneroo)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pb-2">
            <div>
              <span className="text-xs text-muted-foreground block">Session Moneroo ID</span>
              <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded block mt-0.5 w-fit">
                {order.paiement.sessionId}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Payment Transaction ID</span>
              <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded block mt-0.5 w-fit">
                {order.paiement.paymentId ?? "En attente"}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Date du paiement</span>
              <span className="text-sm text-foreground block mt-0.5">
                {order.paiement.paidAt ? formatDate(order.paiement.paidAt) : "-"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block">
              Payload Webhook Moneroo (Source de Vérité - Lecture Seule)
            </Label>
            <div className="rounded-xl border bg-neutral-900 p-4 max-h-[300px] overflow-y-auto">
              <pre className="text-xs font-mono text-neutral-200 whitespace-pre-wrap leading-relaxed select-all">
                {JSON.stringify(order.paiement.rawPayload, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          8. HISTORIQUE & AUDIT DE COMMANDE
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Clock01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
            8. Chronologie des événements de commande & d&apos;audit
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <div className="relative border-l border-border/80 pl-6 ml-3 space-y-6">
            {order.events.map((evt, i) => (
              <div key={i} className="relative">
                {/* Icône sur la ligne */}
                <div className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-background border border-primary text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block tabular-nums">
                    {formatDate(evt.date)}
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {evt.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'action confirmation / motif */}
      {dialog.type ? (
        <DecisionDialog
          open={dialog.open}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          title={dialogCfg.label}
          description={dialogCfg.description}
          tone={dialogCfg.variant === "destructive" ? "danger" : dialog.type === "mark-review" ? "warning" : "info"}
          profile={{
            name: order.id,
            email: `${order.apprenant.name} · ${order.formation.title}`,
            initials: "CM",
            status: dialog.type === "revoke-access" ? "danger" : order.paymentStatus,
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
      ) : null}
    </div>
  );
}

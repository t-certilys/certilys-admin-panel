"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft01Icon,
  CheckmarkSquare01Icon,
  MessageLock01Icon,
  Cancel01Icon,
  Alert01Icon,
  Loading02Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  InvoiceIcon,
  Location01Icon,
  Mail01Icon,
  Book01Icon,
  Calendar01Icon,
  ClipboardCheck,
  Download01Icon,
  EyeIcon,
  SquareArrowUp01Icon,
  Shield01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  type InstructorApplication,
  type InstructorApplicationStatus,
  mockInstructorApplications,
  instructorStatusConfig,
  formatDate,
} from "@/lib/mock/admin-instructors-data";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ActionType = "approve" | "request-changes" | "reject";

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
    auditEvent: string;
    icon: any;
  }
> = {
  approve: {
    label: "Approuver le formateur",
    description:
      "Le formateur sera autorisé à publier des formations sur Certilys. Cette action sera consignée dans les logs d'audit.",
    confirmLabel: "Approuver",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    variant: "default",
    auditEvent: "INSTRUCTOR_APPROVED",
    icon: CheckmarkSquare01Icon,
  },
  "request-changes": {
    label: "Demander des corrections",
    description:
      "Le formateur sera notifié et devra corriger son dossier avant un nouvel examen.",
    confirmLabel: "Envoyer la demande",
    requiresReason: true,
    reasonLabel: "Motif de la demande de correction",
    reasonPlaceholder: "Décrivez précisément les corrections attendues…",
    variant: "default",
    auditEvent: "INSTRUCTOR_CHANGES_REQUESTED",
    icon: MessageLock01Icon,
  },
  reject: {
    label: "Rejeter la candidature",
    description:
      "La candidature sera définitivement rejetée. Cette action est consignée dans les logs d'audit.",
    confirmLabel: "Rejeter",
    requiresReason: true,
    reasonLabel: "Motif du rejet (obligatoire)",
    reasonPlaceholder: "Expliquez la raison du rejet…",
    variant: "destructive",
    auditEvent: "INSTRUCTOR_REJECTED",
    icon: Cancel01Icon,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de formatage
// ─────────────────────────────────────────────────────────────────────────────

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} Ko`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} Mo`;
}

function getLegalStatusLabel(status?: "INDIVIDUAL" | "COMPANY"): string {
  if (!status) return "—";
  return status === "INDIVIDUAL"
    ? "Personne physique (Individuel)"
    : "Personne morale (Société / Cabinet)";
}

function getDocTypeLabel(type?: "ID_CARD" | "PASSPORT" | "DRIVING_LICENSE"): string {
  if (!type) return "—";
  switch (type) {
    case "ID_CARD":
      return "Carte Nationale d'Identité";
    case "PASSPORT":
      return "Passeport International";
    case "DRIVING_LICENSE":
      return "Permis de Conduire";
    default:
      return "Document";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation appel API
// ─────────────────────────────────────────────────────────────────────────────

async function simulateApiCall(
  type: ActionType,
  id: string,
  reason?: string
): Promise<void> {
  await new Promise((r) => setTimeout(r, 1200));
  if (Math.random() < 0.03) {
    throw new Error("Erreur de connexion avec le serveur. Veuillez réessayer.");
  }
  console.log(`[AUDIT] ${ACTION_CONFIG[type].auditEvent}`, {
    instructorId: id,
    reason,
    timestamp: new Date().toISOString(),
  });
}

function StatusBadge({ status }: { status: InstructorApplicationStatus }) {
  const cfg = instructorStatusConfig[status];
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

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────

export default function InstructorDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;



  // Récupération simulée
  const [instructor, setInstructor] =
    React.useState<InstructorApplication | null>(null);
  const [loadError, setLoadError] = React.useState(false);

  // État de prévisualisation du document
  const [previewOpen, setPreviewOpen] = React.useState(false);

  React.useEffect(() => {
    const found = mockInstructorApplications.find((i) => i.id === id);
    if (found) {
      setInstructor(found);
    } else {
      setLoadError(true);
    }
  }, [id]);

  // Dialog action
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

  async function handleConfirm() {
    if (!dialog.type || !instructor) return;
    setDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await simulateApiCall(dialog.type, instructor.id, dialog.reason);

      const newStatus: InstructorApplicationStatus =
        dialog.type === "approve"
          ? "APPROVED"
          : dialog.type === "reject"
            ? "REJECTED"
            : "CHANGES_REQUESTED";

      setInstructor((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              lastDecisionReason: dialog.reason || prev.lastDecisionReason,
              lastDecisionAt: new Date().toISOString(),
            }
          : prev
      );

      setDialog((prev) => ({ ...prev, open: false, loading: false }));
    } catch (err) {
      setDialog((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : "Une erreur est survenue.",
      }));
    }
  }

  // Erreur de chargement
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 px-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-7 text-destructive" size={28} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Formateur introuvable
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ce dossier n&apos;existe pas ou a été supprimé.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/instructors">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" size={16} strokeWidth={1.5} />
            Retour à la liste
          </Link>
        </Button>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-48 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-96 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }



  // ── Analyse de la complétude du dossier
  const hasPayload = !!instructor.verificationPayload;
  const isDocMissing = !instructor.verificationPayload?.identityDocument;
  const completeness = instructor.verificationCompleteness;

  // Une condition critique est manquante si :
  // - pas de payload du tout (dossier non soumis)
  // - completeness contient au moins un critère faux
  // - le document d'identité est absent
  const isCriticalMissing =
    !hasPayload ||
    isDocMissing ||
    !completeness?.hasLegalIdentity ||
    !completeness?.hasAddress ||
    !completeness?.hasIdentityDocument ||
    !completeness?.hasHonorDeclaration;

  // Calcul du message d'explication si blocage d'approbation
  let approvalBlockReason = "";
  if (!hasPayload) {
    approvalBlockReason = "Le dossier administratif n'a pas encore été soumis.";
  } else if (isDocMissing) {
    approvalBlockReason = "La pièce d'identité officielle est absente du dossier.";
  } else if (!completeness?.hasLegalIdentity) {
    approvalBlockReason = "L'identité légale déclarée est incomplète ou invalide.";
  } else if (!completeness?.hasAddress) {
    approvalBlockReason = "L'adresse postale n'est pas entièrement renseignée.";
  } else if (!completeness?.hasHonorDeclaration) {
    approvalBlockReason = "La déclaration sur l'honneur n'a pas été acceptée.";
  }

  const dialogCfg = ACTION_CONFIG[dialog.type ?? "approve"];
  const canConfirmAction =
    !dialogCfg?.requiresReason || dialog.reason.trim().length >= 10;

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
            <Link href="/dashboard/instructors" id="btn-back-to-list">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" size={16} strokeWidth={1.5} />
              Formateurs
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <StatusBadge status={instructor.status} />
        </div>

        {/* Boutons d'action décisionnelle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bouton Approuver (Désactivé si manque critique) */}
          <Button
            id="btn-detail-approve"
            variant="outline"
            size="sm"
            className={`gap-2 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 ${
              isCriticalMissing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              if (isCriticalMissing) return;
              openAction("approve");
            }}
            disabled={isCriticalMissing}
          >
            <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4" size={16} strokeWidth={1.5} />
            Approuver
          </Button>

          <Button
            id="btn-detail-request-changes"
            variant="outline"
            size="sm"
            className="gap-2 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
            onClick={() => openAction("request-changes")}
          >
            <HugeiconsIcon icon={MessageLock01Icon} className="size-4" size={16} strokeWidth={1.5} />
            Corrections
          </Button>

          <Button
            id="btn-detail-reject"
            variant="outline"
            size="sm"
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => openAction("reject")}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" size={16} strokeWidth={1.5} />
            Rejeter
          </Button>
        </div>
      </div>

      {/* ── Alerte de blocage si dossier incomplet ─────────────────────────── */}
      {isCriticalMissing && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5 text-sm text-destructive-foreground">
          <HugeiconsIcon icon={Alert01Icon} className="size-5 shrink-0 mt-0.5 text-destructive" size={20} strokeWidth={1.5} />
          <div className="space-y-1">
            <strong className="font-semibold block text-red-600">
              Approbation désactivée
            </strong>
            <span className="text-muted-foreground text-xs">
              {approvalBlockReason} Veuillez demander des corrections ou rejeter cette candidature.
            </span>
          </div>
        </div>
      )}

      {/* ── En-tête profil formateur ─────────────────────────────────────── */}
      <Card className="border-border/60 shadow-none">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
          {/* Avatar */}
          <div
            className={`flex size-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold ${instructor.avatarColor}`}
          >
            {instructor.initials}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground font-sora">
                {instructor.fullName}
              </h1>
              <p className="text-sm text-muted-foreground">{instructor.email}</p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5 shrink-0" size={14} strokeWidth={1.5} />
                {instructor.email}
              </span>
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5 shrink-0" size={14} strokeWidth={1.5} />
                {instructor.country}
              </span>
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Book01Icon} className="size-3.5 shrink-0" size={14} strokeWidth={1.5} />
                {instructor.specialty}
              </span>
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Calendar01Icon} className="size-3.5 shrink-0" size={14} strokeWidth={1.5} />
                Soumis le {formatDate(instructor.submittedAt)}
              </span>
            </div>
          </div>

          {/* Dossier complet badge */}
          <div className="shrink-0">
            {instructor.isComplete && !isCriticalMissing ? (
              <Badge
                variant="outline"
                className="gap-1.5 text-emerald-600 border-emerald-500/40 bg-emerald-500/10"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" size={14} strokeWidth={1.5} />
                Dossier complet
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 text-amber-600 border-amber-500/40 bg-amber-500/10"
              >
                <HugeiconsIcon icon={Alert01Icon} className="size-3.5" size={14} strokeWidth={1.5} />
                Dossier incomplet
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Dossier administratif complet ─────────────────────────────────── */}
      <h2 className="text-lg font-semibold tracking-tight text-foreground font-sora mt-2">
        Dossier de Vérification Administrative
      </h2>

      {!hasPayload ? (
        <Card className="border-border/60 shadow-none border-dashed bg-muted/10 py-12 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HugeiconsIcon icon={InvoiceIcon} size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Aucun dossier administratif
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                Ce formateur n&apos;a soumis aucune donnée administrative de vérification légale.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Bloc 1 : Informations Légales */}
          <Card className="border-border/60 shadow-none flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
                1. Informations légales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm flex-1">
              <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                <span className="text-muted-foreground col-span-1">Statut juridique</span>
                <span className="font-medium text-foreground col-span-2 text-right">
                  {getLegalStatusLabel(instructor.verificationPayload?.legalStatus)}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                <span className="text-muted-foreground col-span-1">Nom légal</span>
                <span className="font-medium text-foreground col-span-2 text-right">
                  {instructor.verificationPayload?.legalLastName || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                <span className="text-muted-foreground col-span-1">Prénom(s)</span>
                <span className="font-medium text-foreground col-span-2 text-right">
                  {instructor.verificationPayload?.legalFirstNames || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                <span className="text-muted-foreground col-span-1">Nationalité</span>
                <span className="font-medium text-foreground col-span-2 text-right">
                  {instructor.verificationPayload?.nationality || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                <span className="text-muted-foreground col-span-1">Date de naissance</span>
                <span className="font-medium text-foreground col-span-2 text-right">
                  {instructor.verificationPayload?.birthDate
                    ? formatDate(instructor.verificationPayload.birthDate)
                    : "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 gap-2">
                <span className="text-muted-foreground col-span-1">Pays de résidence</span>
                <span className="font-medium text-foreground col-span-2 text-right">
                  {instructor.verificationPayload?.residenceCountry || "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bloc 2 : Adresse déclarée */}
          <Card className="border-border/60 shadow-none flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={Location01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
                2. Adresse déclarée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm flex-1">
              <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                <span className="text-muted-foreground col-span-1">Adresse</span>
                <span className="font-medium text-foreground col-span-2 text-right break-words">
                  {instructor.verificationPayload?.addressLine || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                <span className="text-muted-foreground col-span-1">Code postal</span>
                <span className="font-medium text-foreground col-span-2 text-right">
                  {instructor.verificationPayload?.postalCode || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                <span className="text-muted-foreground col-span-1">Ville</span>
                <span className="font-medium text-foreground col-span-2 text-right">
                  {instructor.verificationPayload?.city || "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 gap-2">
                <span className="text-muted-foreground col-span-1">Pays</span>
                <span className="font-medium text-foreground col-span-2 text-right">
                  {instructor.verificationPayload?.residenceCountry || "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bloc 3 : Pièce d'identité officielle */}
          <Card className="border-border/60 shadow-none flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={InvoiceIcon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
                3. Pièce d&apos;identité officielle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              {isDocMissing ? (
                <div className="text-center py-6 flex flex-col items-center gap-2 flex-1 justify-center">
                  <HugeiconsIcon icon={Alert01Icon} className="size-8 text-destructive" size={32} strokeWidth={1.5} />
                  <span className="text-sm font-medium text-destructive">Document d&apos;identité manquant</span>
                  <span className="text-xs text-muted-foreground max-w-[220px]">
                    Aucune pièce d&apos;identité fournie par le formateur dans sa soumission.
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                      <span className="text-muted-foreground col-span-1">Type</span>
                      <span className="font-medium text-foreground col-span-2 text-right">
                        {getDocTypeLabel(instructor.verificationPayload?.identityDocument?.type)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                      <span className="text-muted-foreground col-span-1">Nom fichier</span>
                      <span className="font-medium text-foreground col-span-2 text-right truncate">
                        {instructor.verificationPayload?.identityDocument?.fileName || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                      <span className="text-muted-foreground col-span-1">Format</span>
                      <span className="font-medium text-foreground col-span-2 text-right">
                        {instructor.verificationPayload?.identityDocument?.fileMimeType || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                      <span className="text-muted-foreground col-span-1">Taille</span>
                      <span className="font-medium text-foreground col-span-2 text-right">
                        {formatFileSize(instructor.verificationPayload?.identityDocument?.fileSize)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-1 gap-2">
                      <span className="text-muted-foreground col-span-1">Uploadé le</span>
                      <span className="font-medium text-foreground col-span-2 text-right">
                        {instructor.verificationPayload?.identityDocument?.uploadedAt
                          ? formatDate(instructor.verificationPayload.identityDocument.uploadedAt)
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Button
                      variant="outline"
                      size="xs"
                      className="gap-1 px-2.5 h-8 text-[11px]"
                      onClick={() => setPreviewOpen(true)}
                    >
                      <HugeiconsIcon icon={EyeIcon} className="size-3.5" size={14} strokeWidth={1.5} />
                      Prévisualiser
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="gap-1 px-2.5 h-8 text-[11px]"
                      asChild
                    >
                      <a
                        href={instructor.verificationPayload?.identityDocument?.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <HugeiconsIcon icon={SquareArrowUp01Icon} className="size-3.5" size={14} strokeWidth={1.5} />
                        Nouvel onglet
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="gap-1 px-2.5 h-8 text-[11px]"
                      asChild
                    >
                      <a
                        href={instructor.verificationPayload?.identityDocument?.fileUrl}
                        download={instructor.verificationPayload?.identityDocument?.fileName}
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" size={14} strokeWidth={1.5} />
                        Télécharger
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bloc 4 : Déclaration d'honneur */}
          <Card className="border-border/60 shadow-none flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <HugeiconsIcon icon={ClipboardCheck} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
                4. Déclaration d&apos;honneur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                  <span className="text-muted-foreground col-span-1">Acceptée</span>
                  <span className="col-span-2 text-right">
                    {instructor.verificationPayload?.honorDeclarationAccepted ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/15">
                        Oui, acceptée
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/15">
                        Non acceptée
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b border-border/30 gap-2">
                  <span className="text-muted-foreground col-span-1">Date signature</span>
                  <span className="font-medium text-foreground col-span-2 text-right">
                    {instructor.verificationPayload?.honorDeclarationAcceptedAt
                      ? formatDate(instructor.verificationPayload.honorDeclarationAcceptedAt)
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground italic border border-border/40 mt-4">
                « Le formateur certifie sur l&apos;honneur l&apos;exactitude absolue des informations soumises dans ce dossier et s&apos;engage à fournir tout justificatif légal sur simple demande. »
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Checklist de validation + Historique décision ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
        {/* Checklist Validation */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              Checklist de validation administrative
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <p className="text-xs text-muted-foreground">
              Veuillez examiner attentivement le dossier administratif complet soumis par le Formateur. Les 4 critères ci-dessous doivent impérativement être validés pour autoriser l&apos;approbation du profil formateur.
            </p>

            <div className="space-y-2.5 mt-2">
              {/* Critère 1 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  {completeness?.hasLegalIdentity ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500" size={16} strokeWidth={1.5} />
                  ) : (
                    <HugeiconsIcon icon={Alert01Icon} className="size-4 text-amber-500" size={16} strokeWidth={1.5} />
                  )}
                  Identité légale renseignée
                </span>
                {completeness?.hasLegalIdentity ? (
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-[10px]">Valide</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/30 text-[10px]">Incomplet</Badge>
                )}
              </div>

              {/* Critère 2 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  {completeness?.hasAddress ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500" size={16} strokeWidth={1.5} />
                  ) : (
                    <HugeiconsIcon icon={Alert01Icon} className="size-4 text-amber-500" size={16} strokeWidth={1.5} />
                  )}
                  Adresse déclarée valide
                </span>
                {completeness?.hasAddress ? (
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-[10px]">Valide</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/30 text-[10px]">Incomplet</Badge>
                )}
              </div>

              {/* Critère 3 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  {completeness?.hasIdentityDocument ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500" size={16} strokeWidth={1.5} />
                  ) : (
                    <HugeiconsIcon icon={Alert01Icon} className="size-4 text-destructive" size={16} strokeWidth={1.5} />
                  )}
                  Pièce d&apos;identité officielle fournie
                </span>
                {completeness?.hasIdentityDocument ? (
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-[10px]">Présente</Badge>
                ) : (
                  <Badge variant="outline" className="text-destructive bg-destructive/10 border-destructive/30 text-[10px]">Absente</Badge>
                )}
              </div>

              {/* Critère 4 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  {completeness?.hasHonorDeclaration ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500" size={16} strokeWidth={1.5} />
                  ) : (
                    <HugeiconsIcon icon={Alert01Icon} className="size-4 text-amber-500" size={16} strokeWidth={1.5} />
                  )}
                  Déclaration sur l&apos;honneur signée
                </span>
                {completeness?.hasHonorDeclaration ? (
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-[10px]">Signée</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/30 text-[10px]">Manquante</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historique décisions */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={ClipboardCheck} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
              Historique des décisions administratives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Toutes les décisions relatives à ce profil sont enregistrées de façon permanente et inaltérable dans les registres d&apos;audit de Certilys.
            </p>

            <div className="space-y-3.5">
              {instructor.lastDecisionAt ? (
                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={instructor.status} />
                    <span className="text-xs text-muted-foreground">
                      le {formatDate(instructor.lastDecisionAt)}
                    </span>
                  </div>
                  {instructor.lastDecisionReason && (
                    <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-foreground italic border border-border/20">
                      «&nbsp;{instructor.lastDecisionReason}&nbsp;»
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                    <HugeiconsIcon icon={Shield01Icon} className="size-3 text-muted-foreground/75" size={12} strokeWidth={1.5} />
                    Audit Log : IP: 192.168.100.40 | Auteur: Admin Certilys
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2 bg-muted/10 rounded-xl border border-dashed border-border/60">
                  <HugeiconsIcon icon={ClipboardCheck} size={24} strokeWidth={1.5} className="text-muted-foreground/60" />
                  <span>Aucune décision antérieure enregistrée.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Formations soumises (Dossier Pédagogique) ───────────────────── */}
      <Card className="border-border/60 shadow-none mt-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon icon={InvoiceIcon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
            Dossier Pédagogique : Formations soumises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-foreground tabular-nums leading-none">
              {instructor.coursesSubmitted}
            </span>
            <span className="text-sm text-muted-foreground mb-0.5">
              formation{instructor.coursesSubmitted > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2.5">
            Le détail complet et pédagogique de ces {instructor.coursesSubmitted} formation(s) est consultable dans l&apos;onglet de validation des cours.
          </p>
        </CardContent>
      </Card>

      {/* ── Dialog prévisualisation de pièce d'identité ───────────────────── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[min(calc(100vw-2rem),46rem)] max-h-[min(760px,calc(100dvh-2rem))] overflow-hidden rounded-2xl p-0 border border-border/60">
          <div className="flex max-h-[inherit] flex-col">
            <DialogHeader className="shrink-0 px-6 pt-6 pb-4 sm:px-7 text-left border-b border-border/30">
              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                <HugeiconsIcon icon={EyeIcon} className="size-4 text-primary shrink-0" size={16} strokeWidth={1.5} />
                <span className="truncate" title={instructor.verificationPayload?.identityDocument?.fileName}>
                  Prévisualisation : {instructor.verificationPayload?.identityDocument?.fileName}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {getDocTypeLabel(instructor.verificationPayload?.identityDocument?.type)} ({instructor.verificationPayload?.identityDocument?.fileMimeType})
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 sm:px-7 sm:py-5 bg-muted/10">
              {instructor.verificationPayload?.identityDocument?.fileMimeType === "application/pdf" ? (
                <div className="w-full h-full flex flex-col justify-between items-center bg-card rounded-lg p-6 text-center border min-w-0 overflow-hidden">
                  <HugeiconsIcon icon={InvoiceIcon} size={48} className="text-primary/70 mb-4 animate-bounce shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground">Prévisualisation PDF simulée</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1 break-words">
                    Les navigateurs affichent les fichiers PDF dans un visualiseur interactif intégré. En production, un composant de type iframe charge le document sécurisé depuis : <br />
                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground font-mono mt-2 block break-all">
                      {instructor.verificationPayload?.identityDocument?.fileUrl}
                    </code>
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-2 mt-6 w-full justify-center">
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                      <a
                        href={instructor.verificationPayload?.identityDocument?.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ouvrir dans un nouvel onglet
                      </a>
                    </Button>
                    <Button size="sm" asChild className="w-full sm:w-auto">
                      <a
                        href={instructor.verificationPayload?.identityDocument?.fileUrl}
                        download={instructor.verificationPayload?.identityDocument?.fileName}
                      >
                        Télécharger le fichier
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                // Simulation d'une preview d'image (ou image mockée)
                <div className="flex flex-col items-center justify-center w-full text-center py-4 min-w-0 overflow-hidden">
                  <div className="relative border rounded-lg overflow-hidden bg-card shadow-sm p-4 w-full max-w-xs min-w-0">
                    <div className="w-full h-40 bg-gradient-to-tr from-muted/50 to-primary/5 flex items-center justify-center rounded border border-dashed border-border/80">
                      <HugeiconsIcon icon={UserIcon} size={40} className="text-primary/20 shrink-0" />
                    </div>
                    <div className="text-left mt-3 space-y-1 text-xs">
                      <p className="font-semibold text-foreground truncate">{instructor.fullName}</p>
                      <p className="text-muted-foreground truncate">{getDocTypeLabel(instructor.verificationPayload?.identityDocument?.type)}</p>
                      <p className="text-[10px] text-muted-foreground">Mock Preview Image - Certilys Admin Security</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="shrink-0 border-t bg-background px-6 py-6 sm:px-7 sm:py-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setPreviewOpen(false)} size="sm" className="w-full sm:w-auto">
                Fermer
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog confirmation d'action décisionnelle ───────────────────── */}
      {dialog.type && (
        <Dialog open={dialog.open} onOpenChange={(o) => !o && closeDialog()}>
          <DialogContent className="w-[min(calc(100vw-2rem),46rem)] max-h-[min(760px,calc(100dvh-2rem))] overflow-hidden rounded-2xl p-0 border border-border/60">
            <div className="flex max-h-[inherit] flex-col">
              <DialogHeader className="shrink-0 px-6 pt-6 pb-4 sm:px-7 text-left">
                <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                  <HugeiconsIcon
                    icon={dialogCfg.icon}
                    className={`size-4 ${dialog.type === "reject" ? "text-destructive" : "text-primary"}`}
                    size={16}
                    strokeWidth={1.5}
                  />
                  {dialogCfg.label}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  {dialogCfg.description}
                </DialogDescription>
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 sm:px-7 sm:py-5 space-y-4">
                {/* Récap formateur - Grid responsive à 3 colonnes */}
                <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] rounded-xl bg-muted/60 p-4 border border-border/40 min-w-0 overflow-hidden">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold mx-auto sm:mx-0 ${instructor.avatarColor}`}
                  >
                    {instructor.initials}
                  </div>
                  <div className="min-w-0 text-center sm:text-left space-y-0.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {instructor.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {instructor.email}
                    </p>
                  </div>
                  <div className="shrink-0 self-start sm:self-center">
                    <StatusBadge status={instructor.status} />
                  </div>
                </div>

                {/* Saisie motif (obligatoire pour corrections/rejet) */}
                {dialogCfg.requiresReason && (
                  <div className="space-y-2">
                    <Label htmlFor="detail-action-reason" className="text-xs font-medium text-foreground">
                      {dialogCfg.reasonLabel}
                      <span className="ml-1 text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="detail-action-reason"
                      value={dialog.reason}
                      onChange={(e) =>
                        setDialog((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder={dialogCfg.reasonPlaceholder}
                      rows={3}
                      className="resize-none text-sm w-full"
                      disabled={dialog.loading}
                    />
                    {dialog.reason.trim().length > 0 &&
                      dialog.reason.trim().length < 10 && (
                        <p className="text-xs text-destructive">
                          Minimum 10 caractères requis pour valider cette décision.
                        </p>
                      )}
                  </div>
                )}

                {/* Zone d'erreur */}
                {dialog.error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0" size={16} strokeWidth={1.5} />
                    {dialog.error}
                  </div>
                )}
              </div>

              <DialogFooter className="shrink-0 border-t bg-background px-6 py-6 sm:px-7 sm:py-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  disabled={dialog.loading}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button
                  variant={dialogCfg.variant}
                  onClick={handleConfirm}
                  disabled={dialog.loading || !canConfirmAction}
                  id={`btn-confirm-${dialog.type}`}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {dialog.loading ? (
                    <>
                      <HugeiconsIcon icon={Loading02Icon} className="size-4 animate-spin mr-2" size={16} strokeWidth={1.5} />
                      En cours…
                    </>
                  ) : (
                    dialogCfg.confirmLabel
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft01Icon,
  CheckmarkSquare01Icon,
  MessageLock01Icon,
  Cancel01Icon,
  Alert01Icon,
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
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DecisionDialog, DocumentPreviewDialog } from "@/components/certilys-ui/dialogs";

import {
  type InstructorApplication,
  type InstructorApplicationStatus,
  instructorStatusConfig,
  formatDate,
} from "@/lib/mock/admin-instructors-data";
import {
  approveInstructorApplicationAction,
  getInstructorApplicationAction,
  rejectInstructorApplicationAction,
  requestInstructorChangesAction,
} from "@/lib/admin-instructors-actions";

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
    icon: IconSvgElement;
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

function getLegalStatusLabel(
  status?: "INDIVIDUAL" | "ORGANIZATION" | "COMPANY",
): string {
  if (!status) return "—";
  if (status === "INDIVIDUAL") return "Personne physique (Individuel)";
  if (status === "ORGANIZATION") return "Organisation / Association";
  return "Personne morale (Société / Cabinet)";
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

async function submitInstructorDecision(
  type: ActionType,
  id: string,
  reason?: string
): Promise<InstructorApplication> {
  if (type === "approve") {
    return approveInstructorApplicationAction(id, reason);
  }
  if (type === "reject") {
    return rejectInstructorApplicationAction(id, reason ?? "");
  }
  return requestInstructorChangesAction(id, reason ?? "");
}

function isReviewableApplication(status: InstructorApplicationStatus) {
  return status === "PENDING";
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
    let active = true;
    setInstructor(null);
    setLoadError(false);

    getInstructorApplicationAction(id)
      .then((application) => {
        if (!active) return;
        if (application) {
          setInstructor(application);
        } else {
          setLoadError(true);
        }
      })
      .catch(() => {
        if (!active) return;
        setLoadError(true);
      });

    return () => {
      active = false;
    };
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
    if (!instructor || !isReviewableApplication(instructor.status)) return;

    setDialog({ open: true, type, reason: "", loading: false, error: null });
  }

  function closeDialog() {
    if (dialog.loading) return;
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleConfirm(reasonOverride?: string) {
    if (!dialog.type || !instructor) return;
    const reason = reasonOverride ?? dialog.reason;
    setDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const updated = await submitInstructorDecision(
        dialog.type,
        instructor.id,
        reason,
      );

      setInstructor(updated);

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
  const canReviewApplication = isReviewableApplication(instructor.status);

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
        {canReviewApplication ? (
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
        ) : null}
      </div>

      {/* ── Alerte de blocage si dossier incomplet ─────────────────────────── */}
      {canReviewApplication && isCriticalMissing && (
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
      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        fileName={instructor.verificationPayload?.identityDocument?.fileName ?? "document"}
        documentType={getDocTypeLabel(instructor.verificationPayload?.identityDocument?.type)}
        url={instructor.verificationPayload?.identityDocument?.fileUrl}
        mimeType={instructor.verificationPayload?.identityDocument?.fileMimeType}
      />

      {/* ── Dialog confirmation d'action décisionnelle ───────────────────── */}
      {dialog.type ? (
        <DecisionDialog
          open={dialog.open}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          title={ACTION_CONFIG[dialog.type].label}
          description={ACTION_CONFIG[dialog.type].description}
          tone={ACTION_CONFIG[dialog.type].variant === "destructive" ? "danger" : dialog.type === "approve" ? "success" : "info"}
          profile={{
            name: instructor.fullName,
            email: instructor.email,
            initials: instructor.initials,
            status: instructor.status,
          }}
          requireReason={ACTION_CONFIG[dialog.type].requiresReason}
          reasonLabel={ACTION_CONFIG[dialog.type].reasonLabel}
          reasonPlaceholder={ACTION_CONFIG[dialog.type].reasonPlaceholder}
          minReasonLength={10}
          confirmLabel={ACTION_CONFIG[dialog.type].confirmLabel}
          cancelLabel="Annuler"
          loading={dialog.loading}
          error={dialog.error}
          onConfirm={({ reason }) => handleConfirm(reason)}
        />
      ) : null}
    </div>
  );
}

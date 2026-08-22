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
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  EyeIcon,
  SquareArrowUp01Icon,
  Book01Icon,
  Video01Icon,
  Image01Icon,
  Pdf01Icon,
  LinkSquare01Icon,
  File01Icon,
  Clock01Icon,
  Megaphone01Icon,
  Target01Icon,
  ListViewIcon,
  GlobeIcon,
  Tag01Icon,
  Layout01Icon,
  Archive01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DecisionDialog } from "@/components/certilys-ui/dialogs";
import {
  approveAdminCourseAction,
  archiveAdminCourseAction,
  restoreAdminCourseAction,
  deleteAdminCourseAction,
  getAdminCourseAction,
  rejectAdminCourseAction,
  requestAdminCourseChangesAction,
} from "@/lib/admin-courses-actions";

import {
  type AdminCourseSubmission,
  type CourseSubmissionStatus,
  type CourseAsset,
  courseStatusConfig,
  COURSE_LEVELS,
  formatDate,
  formatPrice,
  formatDuration,
} from "@/lib/mock/admin-courses-data";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ActionType = "approve" | "request-changes" | "reject" | "archive" | "restore" | "delete";

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
    label: "Approuver la formation",
    description:
      "La formation sera marquée comme approuvée et pourra être publiée si le formateur est également approuvé. Cette action sera consignée dans les logs d'audit.",
    confirmLabel: "Approuver",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    variant: "default",
    auditEvent: "COURSE_APPROVED",
    icon: CheckmarkSquare01Icon,
  },
  "request-changes": {
    label: "Demander des corrections",
    description:
      "Le formateur sera notifié et devra corriger la formation avant un nouvel examen.",
    confirmLabel: "Envoyer la demande",
    requiresReason: true,
    reasonLabel: "Motif de la demande de correction",
    reasonPlaceholder: "Décrivez précisément les corrections attendues…",
    variant: "default",
    auditEvent: "COURSE_CHANGES_REQUESTED",
    icon: MessageLock01Icon,
  },
  reject: {
    label: "Rejeter la formation",
    description:
      "La formation sera rejetée. Cette action est définitive et consignée dans les logs d'audit.",
    confirmLabel: "Rejeter",
    requiresReason: true,
    reasonLabel: "Motif du rejet (obligatoire)",
    reasonPlaceholder: "Expliquez la raison du rejet…",
    variant: "destructive",
    auditEvent: "COURSE_REJECTED",
    icon: Cancel01Icon,
  },
  archive: {
    label: "Masquer la formation",
    description:
      "La formation sera archivée et ne sera plus visible dans le catalogue public. Ses données et son historique seront conservés.",
    confirmLabel: "Masquer la formation",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    variant: "default",
    auditEvent: "COURSE_ARCHIVED",
    icon: Archive01Icon,
  },
  restore: {
    label: "Restaurer la formation",
    description:
      "La formation retrouvera le statut qu’elle avait avant son archivage et redeviendra visible si elle était publiée.",
    confirmLabel: "Restaurer la formation",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    variant: "default",
    auditEvent: "COURSE_RESTORED",
    icon: CheckmarkCircle02Icon,
  },
  delete: {
    label: "Supprimer définitivement la formation",
    description:
      "La formation et son contenu seront supprimés définitivement. L’opération sera refusée si elle est liée à une commande.",
    confirmLabel: "Supprimer la formation",
    requiresReason: false,
    reasonLabel: "",
    reasonPlaceholder: "",
    variant: "destructive",
    auditEvent: "COURSE_DELETED",
    icon: Delete02Icon,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Simulation API
// ─────────────────────────────────────────────────────────────────────────────

async function applyCourseDecision(
  type: ActionType,
  id: string,
  reason?: string,
): Promise<AdminCourseSubmission> {
  if (type === "approve") {
    return approveAdminCourseAction(id, reason);
  }
  if (type === "request-changes") {
    return requestAdminCourseChangesAction(id, reason ?? "");
  }
  return rejectAdminCourseAction(id, reason ?? "");
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CourseSubmissionStatus }) {
  const cfg = courseStatusConfig[status];
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

function ChecklistItem({
  label,
  ok,
  critical = false,
}: {
  label: string;
  ok: boolean;
  critical?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
      <span className="text-sm font-medium text-foreground flex items-center gap-2">
        {ok ? (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            className="size-4 text-emerald-500"
            size={16}
            strokeWidth={1.5}
          />
        ) : (
          <HugeiconsIcon
            icon={Alert01Icon}
            className={`size-4 ${critical ? "text-destructive" : "text-amber-500"}`}
            size={16}
            strokeWidth={1.5}
          />
        )}
        {label}
      </span>
      {ok ? (
        <Badge
          variant="outline"
          className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-[10px]"
        >
          Valide
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className={`text-[10px] ${
            critical
              ? "text-destructive bg-destructive/10 border-destructive/30"
              : "text-amber-600 bg-amber-500/10 border-amber-500/30"
          }`}
        >
          {critical ? "Bloquant" : "Manquant"}
        </Badge>
      )}
    </div>
  );
}

function AssetBadge({ asset }: { asset: CourseAsset }) {
  const iconMap: Record<
    CourseAsset["type"],
    IconSvgElement
  > = {
    PDF: Pdf01Icon,
    FILE: File01Icon,
    LINK: LinkSquare01Icon,
  };
  const Icon = iconMap[asset.type];
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 border border-border/40 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
      <HugeiconsIcon icon={Icon} className="size-3" size={12} strokeWidth={1.5} />
      {asset.title}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  // Récupération simulée
  const [course, setCourse] = React.useState<AdminCourseSubmission | null>(
    null,
  );
  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    setCourse(null);
    setLoadError(false);

    getAdminCourseAction(id)
      .then((found) => {
        if (!mounted) return;
        if (found) {
          setCourse(found);
        } else {
          setLoadError(true);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setLoadError(true);
      });

    return () => {
      mounted = false;
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
    if (
      (type === "approve" || type === "request-changes" || type === "reject") &&
      course?.status !== "SUBMITTED"
    ) return;
    setDialog({ open: true, type, reason: "", loading: false, error: null });
  }

  function closeDialog() {
    if (dialog.loading) return;
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleConfirm(reasonOverride?: string) {
    if (!dialog.type || !course) return;
    const reason = reasonOverride ?? dialog.reason;
    setDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (dialog.type === "archive") {
        const archivedCourse = await archiveAdminCourseAction(course.id);
        setCourse(archivedCourse);
        setDialog((prev) => ({ ...prev, open: false, loading: false }));
        return;
      }

      if (dialog.type === "restore") {
        const restoredCourse = await restoreAdminCourseAction(course.id);
        setCourse(restoredCourse);
        setDialog((prev) => ({ ...prev, open: false, loading: false }));
        return;
      }

      if (dialog.type === "delete") {
        await deleteAdminCourseAction(course.id);
        setDialog((prev) => ({ ...prev, open: false, loading: false }));
        router.replace("/dashboard/courses");
        return;
      }

      const updatedCourse = await applyCourseDecision(
        dialog.type,
        course.id,
        reason,
      );
      setCourse(updatedCourse);

      setDialog((prev) => ({ ...prev, open: false, loading: false }));
    } catch (err) {
      setDialog((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Une erreur est survenue.",
      }));
    }
  }

  // ── Erreur de chargement
  if (loadError) {
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
            Formation introuvable
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ce dossier n&apos;existe pas ou a été supprimé.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/courses">
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

  if (!course) {
    return (
      <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
        <div className="h-96 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  // ── Checklist
  const hasTitle = course.title.trim().length > 0;
  const hasDescription = course.description.trim().length >= 50;
  const hasValidPrice = course.price > 0;
  const hasCategoryLevelLanguage =
    !!course.category && !!course.level && !!course.language;
  const hasThumbnail = !!course.thumbnailUrl;
  const hasModulesAndLessons =
    course.modules.length > 0 &&
    course.modules.some((m) => m.lessons.length > 0);
  const hasTargetAudience = course.targetAudience.length > 0;
  const hasVideoContent = course.modules.some((m) =>
    m.lessons.some((l) => l.videoUrl !== null && l.videoStatus === "READY"),
  );
  const isInstructorApproved = course.instructorApproved;

  // Critères bloquants pour l'approbation
  const criticalChecks = [
    isInstructorApproved,
    hasTitle,
    hasDescription,
    hasValidPrice,
    hasCategoryLevelLanguage,
    hasModulesAndLessons,
  ];
  const isCriticalMissing = criticalChecks.some((c) => !c);
  const isReviewable = course.status === "SUBMITTED";

  // Raison du blocage
  let approvalBlockReason = "";
  if (!isInstructorApproved) {
    approvalBlockReason =
      "Le formateur n'est pas encore approuvé sur Certilys. Approuvez d'abord le dossier formateur.";
  } else if (!hasTitle) {
    approvalBlockReason = "Le titre de la formation est absent.";
  } else if (!hasDescription) {
    approvalBlockReason =
      "La description est trop courte (minimum 50 caractères).";
  } else if (!hasValidPrice) {
    approvalBlockReason = "Le prix de la formation doit être supérieur à 0.";
  } else if (!hasCategoryLevelLanguage) {
    approvalBlockReason =
      "La catégorie, le niveau ou la langue n'est pas renseigné.";
  } else if (!hasModulesAndLessons) {
    approvalBlockReason =
      "La formation doit contenir au moins 1 module avec au moins 1 leçon.";
  }

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0,
  );
  const totalDuration = course.modules.reduce(
    (sum, m) =>
      sum + m.lessons.reduce((s, l) => s + l.durationMinutes, 0),
    0,
  );
  const freePreviewCount = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.isFreePreview).length,
    0,
  );

  const dialogCfg = ACTION_CONFIG[dialog.type ?? "approve"];

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
            <Link href="/dashboard/courses" id="btn-back-to-courses">
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="size-4"
                size={16}
                strokeWidth={1.5}
              />
              Formations
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <StatusBadge status={course.status} />
        </div>

        {/* Boutons décisionnels */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            id="btn-detail-approve-course"
            variant="outline"
            size="sm"
            className={`gap-2 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 ${
              isCriticalMissing || !isReviewable ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              if (isCriticalMissing || !isReviewable) return;
              openAction("approve");
            }}
            disabled={isCriticalMissing || !isReviewable}
          >
            <HugeiconsIcon
              icon={CheckmarkSquare01Icon}
              className="size-4"
              size={16}
              strokeWidth={1.5}
            />
            Approuver
          </Button>

          <Button
            id="btn-detail-request-changes-course"
            variant="outline"
            size="sm"
            className="gap-2 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
            onClick={() => openAction("request-changes")}
            disabled={!isReviewable}
          >
            <HugeiconsIcon
              icon={MessageLock01Icon}
              className="size-4"
              size={16}
              strokeWidth={1.5}
            />
            Corrections
          </Button>

          <Button
            id="btn-detail-reject-course"
            variant="outline"
            size="sm"
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => openAction("reject")}
            disabled={!isReviewable}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="size-4"
              size={16}
              strokeWidth={1.5}
            />
            Rejeter
          </Button>

          {course.status !== "ARCHIVED" && (
            <Button
              id="btn-detail-archive-course"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => openAction("archive")}
            >
              <HugeiconsIcon icon={Archive01Icon} className="size-4" size={16} strokeWidth={1.5} />
              Masquer
            </Button>
          )}

          {course.status === "ARCHIVED" && (
            <Button
              id="btn-detail-restore-course"
              variant="outline"
              size="sm"
              className="gap-2 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => openAction("restore")}
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" size={16} strokeWidth={1.5} />
              Restaurer
            </Button>
          )}

          <Button
            id="btn-detail-delete-course"
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => openAction("delete")}
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-4" size={16} strokeWidth={1.5} />
            Supprimer
          </Button>
        </div>
      </div>

      {/* ── Alerte blocage ────────────────────────────────────────────────── */}
      {isCriticalMissing && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5 text-sm text-destructive-foreground">
          <HugeiconsIcon
            icon={Alert01Icon}
            className="size-5 shrink-0 mt-0.5 text-destructive"
            size={20}
            strokeWidth={1.5}
          />
          <div className="space-y-1">
            <strong className="font-semibold block text-red-600">
              Approbation désactivée
            </strong>
            <span className="text-muted-foreground text-xs">
              {approvalBlockReason} Veuillez demander des corrections ou rejeter
              cette formation.
            </span>
          </div>
        </div>
      )}

      {/* ── Décision précédente ───────────────────────────────────────────── */}
      {course.lastDecisionReason && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3.5 text-sm">
          <HugeiconsIcon
            icon={Alert01Icon}
            className="size-5 shrink-0 mt-0.5 text-amber-500"
            size={20}
            strokeWidth={1.5}
          />
          <div className="space-y-1">
            <strong className="font-semibold block text-amber-700">
              Motif de la décision précédente
            </strong>
            <span className="text-muted-foreground text-xs">
              {course.lastDecisionReason}
            </span>
            {course.lastDecisionAt && (
              <span className="block text-xs text-muted-foreground/70">
                Le {formatDate(course.lastDecisionAt)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          1. RÉSUMÉ
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon
              icon={Layout01Icon}
              className="size-4 text-primary shrink-0"
              size={16}
              strokeWidth={1.5}
            />
            1. Résumé de la formation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <h1 className="text-xl font-semibold text-foreground font-sora mb-1">
            {course.title || (
              <span className="text-destructive italic">Titre manquant</span>
            )}
          </h1>
          {course.subtitle && (
            <p className="text-sm text-muted-foreground mb-4">
              {course.subtitle}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 mt-4 text-sm">
            {/* Slug */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Slug SEO
              </span>
              <span className="font-mono text-xs text-foreground bg-muted/60 rounded px-1.5 py-0.5 w-fit">
                {course.slug || "—"}
              </span>
            </div>

            {/* Formateur */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Formateur
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${course.instructorAvatarColor}`}
                >
                  {course.instructorInitials}
                </div>
                <span className="text-sm text-foreground">
                  {course.instructorName}
                </span>
                {course.instructorApproved ? (
                  <Badge
                    variant="outline"
                    className="text-[9px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30 px-1"
                  >
                    Approuvé
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[9px] text-destructive bg-destructive/10 border-destructive/30 px-1"
                  >
                    Non approuvé
                  </Badge>
                )}
              </div>
            </div>

            {/* Catégorie */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Catégorie
              </span>
              <span className="text-sm text-foreground">
                {course.category || "—"}
              </span>
            </div>

            {/* Niveau */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Niveau
              </span>
              <span className="text-sm text-foreground">
                {COURSE_LEVELS[course.level]}
              </span>
            </div>

            {/* Langue */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Langue
              </span>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={GlobeIcon}
                  className="size-3.5 text-muted-foreground"
                  size={14}
                  strokeWidth={1.5}
                />
                <span className="text-sm text-foreground">
                  {course.language || "—"}
                </span>
              </div>
            </div>

            {/* Prix */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Prix
              </span>
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Tag01Icon}
                  className="size-3.5 text-muted-foreground"
                  size={14}
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {course.price > 0
                    ? formatPrice(course.price, course.currency)
                    : <span className="text-destructive">Prix non défini</span>}
                </span>
                {course.promoPrice && (
                  <span className="text-xs text-emerald-600 font-medium tabular-nums">
                    →&nbsp;Promo&nbsp;{formatPrice(course.promoPrice, course.currency)}
                  </span>
                )}
              </div>
            </div>

            {/* Date soumission */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Date soumission
              </span>
              <span className="text-sm text-foreground">
                {formatDate(course.submittedAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          2. CONTENU COMMERCIAL
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Description */}
        <Card className="border-border/60 shadow-none md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon
                icon={Megaphone01Icon}
                className="size-4 text-primary shrink-0"
                size={16}
                strokeWidth={1.5}
              />
              2. Contenu commercial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Description */}
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                Description
              </p>
              {course.description.trim().length >= 50 ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              ) : course.description.trim().length > 0 ? (
                <div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {course.description}
                  </p>
                  <p className="text-xs text-destructive mt-1">
                    ⚠ Description trop courte (minimum 50 caractères, actuellement{" "}
                    {course.description.trim().length}).
                  </p>
                </div>
              ) : (
                <p className="text-sm text-destructive italic">
                  Description manquante
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Bénéfices */}
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  Objectifs / Bénéfices
                </p>
                {course.learningOutcomes.length > 0 ? (
                  <ul className="space-y-1.5">
                    {course.learningOutcomes.map((o, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="size-4 shrink-0 mt-0.5 text-emerald-500"
                          size={16}
                          strokeWidth={1.5}
                        />
                        {o}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-amber-600 italic">
                    Aucun objectif défini
                  </p>
                )}
              </div>

              {/* Prérequis */}
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  Prérequis
                </p>
                {course.prerequisites.length > 0 ? (
                  <ul className="space-y-1.5">
                    {course.prerequisites.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Aucun prérequis
                  </p>
                )}
              </div>

              {/* Public cible */}
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  Public cible
                </p>
                {course.targetAudience.length > 0 ? (
                  <ul className="space-y-1.5">
                    {course.targetAudience.map((a, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <HugeiconsIcon
                          icon={Target01Icon}
                          className="size-4 shrink-0 mt-0.5 text-primary/70"
                          size={16}
                          strokeWidth={1.5}
                        />
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-amber-600 italic">
                    Public cible non défini
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════
            3. MÉDIAS
            ══════════════════════════════════════════════════════════════════ */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon
                icon={Image01Icon}
                className="size-4 text-primary shrink-0"
                size={16}
                strokeWidth={1.5}
              />
              3. Médias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Miniature */}
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                Miniature de couverture
              </p>
              {course.thumbnailUrl ? (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnailUrl}
                    alt={`Miniature de ${course.title}`}
                    className="w-full max-w-xs h-36 object-cover rounded-lg border border-border/60"
                  />
                  <div className="absolute inset-0 max-w-xs flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                    <a
                      href={course.thumbnailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-white/90 text-foreground px-2 py-1 rounded text-xs font-medium hover:bg-white transition-colors"
                    >
                      <HugeiconsIcon
                        icon={SquareArrowUp01Icon}
                        className="size-3"
                        size={12}
                        strokeWidth={1.5}
                      />
                      Ouvrir
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-3">
                  <HugeiconsIcon
                    icon={Alert01Icon}
                    className="size-5 text-destructive shrink-0"
                    size={20}
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Miniature manquante
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aucune image de couverture fournie.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Vidéo promo */}
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                Vidéo de présentation
              </p>
              {course.promoVideoUrl ? (
                <div className="flex items-center gap-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon
                      icon={Video01Icon}
                      className="size-4 text-primary"
                      size={16}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {course.promoVideoUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={course.promoVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                      >
                        <HugeiconsIcon
                          icon={EyeIcon}
                          className="size-3.5"
                          size={14}
                          strokeWidth={1.5}
                        />
                        Prévisualiser
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HugeiconsIcon
                    icon={Alert01Icon}
                    className="size-4 text-amber-500"
                    size={16}
                    strokeWidth={1.5}
                  />
                  Vidéo de présentation non fournie
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════
            Méta programme stats
            ══════════════════════════════════════════════════════════════════ */}
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon
                icon={ListViewIcon}
                className="size-4 text-primary shrink-0"
                size={16}
                strokeWidth={1.5}
              />
              Aperçu du programme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Modules
                </span>
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {course.modules.length}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Leçons
                </span>
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {totalLessons}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Durée totale
                </span>
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    className="size-4 text-muted-foreground"
                    size={16}
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {formatDuration(totalDuration)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Aperçus gratuits
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {freePreviewCount} leçon{freePreviewCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          4. PROGRAMME DÉTAILLÉ
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon
              icon={Book01Icon}
              className="size-4 text-primary shrink-0"
              size={16}
              strokeWidth={1.5}
            />
            4. Programme détaillé
          </CardTitle>
        </CardHeader>
        <CardContent>
          {course.modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon
                  icon={Book01Icon}
                  className="size-6 text-muted-foreground"
                  size={24}
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-destructive">
                  Aucun module
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  La formation ne contient pas encore de modules ou de leçons.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module, mIdx) => {
                const moduleDuration = module.lessons.reduce(
                  (s, l) => s + l.durationMinutes,
                  0,
                );
                return (
                  <div
                    key={module.id}
                    className="rounded-xl border border-border/60 overflow-hidden"
                  >
                    {/* En-tête module */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-bold text-muted-foreground shrink-0">
                          Module {mIdx + 1}
                        </span>
                        <span className="text-sm font-semibold text-foreground truncate">
                          {module.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                        <span>{module.lessons.length} leçon{module.lessons.length > 1 ? "s" : ""}</span>
                        <span>{formatDuration(moduleDuration)}</span>
                      </div>
                    </div>

                    {/* Leçons */}
                    <div className="divide-y divide-border/40">
                      {module.lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          className="flex items-start gap-3 px-4 py-3"
                        >
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground mt-0.5">
                            {lIdx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-foreground">
                                {lesson.title}
                              </span>
                              {lesson.isFreePreview && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30 px-1 h-4"
                                >
                                  Aperçu gratuit
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-muted-foreground">
                                {lesson.durationMinutes} min
                              </span>
                              {/* Statut vidéo */}
                              {lesson.videoStatus === "READY" && (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                  <HugeiconsIcon
                                    icon={Video01Icon}
                                    className="size-3"
                                    size={12}
                                    strokeWidth={1.5}
                                  />
                                  Vidéo prête
                                </span>
                              )}
                              {lesson.videoStatus === "PROCESSING" && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                  <HugeiconsIcon
                                    icon={Video01Icon}
                                    className="size-3"
                                    size={12}
                                    strokeWidth={1.5}
                                  />
                                  En traitement
                                </span>
                              )}
                              {lesson.videoStatus === "MISSING" && (
                                <span className="inline-flex items-center gap-1 text-xs text-destructive">
                                  <HugeiconsIcon
                                    icon={Alert01Icon}
                                    className="size-3"
                                    size={12}
                                    strokeWidth={1.5}
                                  />
                                  Vidéo manquante
                                </span>
                              )}
                              {/* Ressources */}
                              {lesson.assets.map((asset) => (
                                <AssetBadge key={asset.id} asset={asset} />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          5. CHECKLIST
          ══════════════════════════════════════════════════════════════════════ */}
      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HugeiconsIcon
              icon={CheckmarkSquare01Icon}
              className="size-4 text-primary shrink-0"
              size={16}
              strokeWidth={1.5}
            />
            5. Checklist de validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <p className="text-xs text-muted-foreground">
            Examinez attentivement le dossier complet. Les critères{" "}
            <span className="text-destructive font-medium">bloquants</span>{" "}
            doivent impérativement être validés pour permettre l&apos;approbation.
          </p>

          <div className="space-y-2 mt-2">
            <ChecklistItem
              label="Formateur approuvé sur Certilys"
              ok={isInstructorApproved}
              critical={true}
            />
            <ChecklistItem
              label="Titre et informations principales présents"
              ok={hasTitle}
              critical={true}
            />
            <ChecklistItem
              label="Description complète (≥ 50 caractères)"
              ok={hasDescription}
              critical={true}
            />
            <ChecklistItem
              label="Prix valide (supérieur à 0)"
              ok={hasValidPrice}
              critical={true}
            />
            <ChecklistItem
              label="Catégorie, niveau et langue renseignés"
              ok={hasCategoryLevelLanguage}
              critical={true}
            />
            <ChecklistItem
              label="Miniature de couverture fournie"
              ok={hasThumbnail}
              critical={false}
            />
            <ChecklistItem
              label="Au moins 1 module et 1 leçon"
              ok={hasModulesAndLessons}
              critical={true}
            />
            <ChecklistItem
              label="Contenu vidéo disponible (au moins 1 vidéo prête)"
              ok={hasVideoContent}
              critical={false}
            />
            <ChecklistItem
              label="Public cible défini"
              ok={hasTargetAudience}
              critical={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Dialog confirmation ──────────────────────────────────────────────── */}
      {dialog.type ? (
        <DecisionDialog
          open={dialog.open}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          title={dialogCfg.label}
          description={dialogCfg.description}
          tone={
            dialogCfg.variant === "destructive"
              ? "danger"
              : dialog.type === "approve" || dialog.type === "restore"
                ? "success"
                : "info"
          }
          profile={{
            name: course.title,
            email: `${course.instructorName} · ${course.category}`,
            initials: course.title.slice(0, 2).toUpperCase(),
            status: course.status,
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

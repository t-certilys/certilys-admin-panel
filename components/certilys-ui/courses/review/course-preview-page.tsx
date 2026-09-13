"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkSquare01Icon,
  Delete02Icon,
  Download01Icon,
  File01Icon,
  FilterIcon,
  GitCompareIcon,
  LinkSquare02Icon,
  MessageAdd01Icon,
  MessageLock01Icon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  getAdminCoursePreviewAction,
  getAdminCourseWithRevisionAction,
} from "@/lib/admin-courses-actions";
import {
  reviewFieldLabel,
  type AdminCoursePreview,
  type AdminCourseRevisionEntry,
  type PreviewLesson,
  type PreviewModule,
  type ReviewCorrectionDraft,
} from "@/lib/courses/course-review.types";
import {
  courseStatusConfig,
  type CourseSubmissionStatus,
} from "@/lib/mock/admin-courses-data";
import { cn } from "@/lib/utils";

import {
  AddCorrectionDialog,
  type CorrectionTarget,
} from "./add-correction-dialog";
import {
  CHANGE_STYLES,
  ChangeBadge,
  ChangeMark,
  formatFileSize,
  formatSeconds,
  ValueBox,
  VideoStage,
  videoState,
} from "./review-ui";
import { useReviewDecisionFlow } from "./use-review-decision-flow";

const VERSIONS = ["live", "revision"] as const;

const ACTIVE_TOGGLE =
  "data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10 data-[state=on]:text-primary";

type Detail = NonNullable<
  Awaited<ReturnType<typeof getAdminCourseWithRevisionAction>>
>;

type LoadResult =
  | { key: string; status: "error" }
  | { key: string; status: "ready"; detail: Detail; preview: AdminCoursePreview };

/**
 * Formation vue comme un apprenant, pour l'administration : programme,
 * lecteur video, descriptions et ressources. Sur une mise a jour, chaque
 * element porte son changement et les videos remplacees se comparent cote a
 * cote. Les corrections se notent au fil de l'examen, puis partent avec la
 * decision.
 */
export function CoursePreviewPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const [version, setVersion] = useQueryState(
    "version",
    parseAsStringLiteral(VERSIONS).withDefault("live"),
  );
  const [lessonParam, setLessonParam] = useQueryState("lesson");
  const [onlyChanges, setOnlyChanges] = useQueryState(
    "changes",
    parseAsBoolean.withDefault(false),
  );
  const [reloadToken, setReloadToken] = React.useState(0);
  const [result, setResult] = React.useState<LoadResult | null>(null);
  const [correctionTarget, setCorrectionTarget] =
    React.useState<CorrectionTarget | null>(null);
  // Le chargement se deduit de la cle : un resultat d'une autre version ou
  // d'un rechargement precedent ne s'affiche jamais.
  const requestKey = `${courseId}:${version}:${reloadToken}`;
  const state =
    result && result.key === requestKey ? result : { status: "loading" as const };

  React.useEffect(() => {
    let active = true;

    Promise.all([
      getAdminCourseWithRevisionAction(courseId),
      getAdminCoursePreviewAction(courseId, version),
    ])
      .then(([detail, preview]) => {
        if (!active) return;
        if (detail && !preview && version === "revision") {
          // Plus de mise a jour a examiner : retour a la version en ligne.
          void setVersion("live");
          return;
        }
        setResult(
          detail && preview
            ? { key: requestKey, status: "ready", detail, preview }
            : { key: requestKey, status: "error" },
        );
      })
      .catch(() => {
        if (active) setResult({ key: requestKey, status: "error" });
      });

    return () => {
      active = false;
    };
  }, [courseId, version, requestKey, setVersion]);

  const preview = state.status === "ready" ? state.preview : null;
  const detail = state.status === "ready" ? state.detail : null;
  const reviewRevisionId =
    version === "revision" ? (preview?.revision?.id ?? null) : null;

  const { openDecision, dialog, draft } = useReviewDecisionFlow({
    courseId,
    revisionId: reviewRevisionId,
    onDone: () => setReloadToken((token) => token + 1),
  });

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <HugeiconsIcon
          icon={Alert02Icon}
          className="size-8 text-destructive"
          size={32}
          strokeWidth={1.5}
        />
        <div>
          <h1 className="text-lg font-semibold">Aperçu indisponible</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            La formation est introuvable ou le serveur ne répond pas.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/courses">Retour aux formations</Link>
        </Button>
      </div>
    );
  }

  if (!preview || !detail) {
    return (
      <div className="flex flex-col gap-5 px-4 py-6 lg:px-6">
        <div className="h-8 w-72 animate-pulse rounded bg-muted" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="aspect-video animate-pulse rounded-xl bg-muted" />
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  const isRevision = preview.version === "revision";
  const hasPendingRevision = Boolean(detail.pendingRevision);
  const courseStatus = detail.course.status;
  const canDecide = isRevision
    ? preview.revision?.status === "SUBMITTED"
    : courseStatus === "SUBMITTED";

  const allLessons = preview.modules.flatMap((item) => item.lessons);
  // La selection suit le programme affiche : avec le filtre des changements,
  // une lecon inchangee ne doit plus occuper le panneau principal.
  const visibleLessons =
    isRevision && onlyChanges
      ? filterChangedModules(preview.modules).flatMap((item) => item.lessons)
      : allLessons;
  const selectedLesson =
    visibleLessons.find((lesson) => lesson.id === lessonParam) ??
    (isRevision ? visibleLessons.find((lesson) => lesson.change) : undefined) ??
    visibleLessons[0] ??
    null;
  const selectedModule = selectedLesson
    ? preview.modules.find((item) =>
        item.lessons.some((lesson) => lesson.id === selectedLesson.id),
      )
    : undefined;
  const playableLessons = allLessons.filter((lesson) => lesson.position);
  const selectedIndex = selectedLesson
    ? playableLessons.findIndex((lesson) => lesson.id === selectedLesson.id)
    : -1;

  const courseEntries = preview.entries.filter(
    (entry) => entry.target?.type === "COURSE",
  );
  const statusConfig =
    courseStatusConfig[courseStatus as CourseSubmissionStatus];

  return (
    <div className="flex flex-col gap-5 px-4 py-6 lg:px-6">
      {/* En-tete */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 space-y-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 gap-2 text-muted-foreground"
          >
            <Link href={`/dashboard/courses/${courseId}`}>
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="size-4"
                size={16}
                strokeWidth={1.5}
              />
              Dossier de la formation
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-sora text-xl font-semibold text-foreground">
              {preview.course.title}
            </h1>
            {statusConfig ? (
              <Badge
                variant="outline"
                className={cn("text-xs", statusConfig.colorClass)}
              >
                {statusConfig.label}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {preview.course.instructor?.displayName ?? "Formateur"} ·{" "}
            {preview.course.lessonsCount} leçon
            {preview.course.lessonsCount > 1 ? "s" : ""} ·{" "}
            {formatSeconds(preview.course.totalDurationSeconds)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasPendingRevision ? (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={version}
              onValueChange={(value) => {
                if (!value) return;
                void setLessonParam(null);
                void setVersion(value as (typeof VERSIONS)[number]);
              }}
              aria-label="Version affichée"
            >
              <ToggleGroupItem value="live" className={cn("px-3", ACTIVE_TOGGLE)}>
                Version en ligne
              </ToggleGroupItem>
              <ToggleGroupItem value="revision" className={cn("px-3", ACTIVE_TOGGLE)}>
                Version proposée
              </ToggleGroupItem>
            </ToggleGroup>
          ) : null}

          {isRevision ? (
            <Toggle
              variant="outline"
              size="sm"
              pressed={onlyChanges}
              onPressedChange={(pressed) => {
                void setLessonParam(null);
                void setOnlyChanges(pressed || null);
              }}
              className={cn("px-3", ACTIVE_TOGGLE)}
            >
              <HugeiconsIcon icon={FilterIcon} className="size-4" size={16} strokeWidth={1.5} />
              Seulement les changements
            </Toggle>
          ) : null}

          {canDecide ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                onClick={() => openDecision("approve")}
              >
                <HugeiconsIcon
                  icon={CheckmarkSquare01Icon}
                  className="size-4"
                  size={16}
                  strokeWidth={1.5}
                />
                {isRevision ? "Publier" : "Approuver"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                onClick={() => openDecision("request-changes")}
              >
                <HugeiconsIcon
                  icon={MessageLock01Icon}
                  className="size-4"
                  size={16}
                  strokeWidth={1.5}
                />
                Corrections
                {draft.items.length > 0 ? (
                  <Badge className="ml-0.5 h-5 min-w-5 px-1.5 text-[11px]">
                    {draft.items.length}
                  </Badge>
                ) : null}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => openDecision("reject")}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="size-4"
                  size={16}
                  strokeWidth={1.5}
                />
                Refuser
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Contexte de la version affichee */}
      {!isRevision && hasPendingRevision ? (
        <Notice tone="info">
          Une mise à jour de cette formation attend votre décision.{" "}
          <button
            type="button"
            className="font-semibold underline underline-offset-2"
            onClick={() => {
              void setLessonParam(null);
              void setVersion("revision");
            }}
          >
            Examiner la version proposée
          </button>
        </Notice>
      ) : null}
      {isRevision && preview.revision ? (
        <RevisionSummary preview={preview} />
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          {selectedLesson ? (
            <LessonView
              lesson={selectedLesson}
              moduleTitle={selectedModule?.title ?? null}
              isRevision={isRevision}
              version={preview.version}
              courseId={courseId}
              corrections={draft.items.filter(
                (item) => item.targetId === selectedLesson.id,
              )}
              canAddCorrection={canDecide && selectedLesson.change !== "REMOVED"}
              onAddCorrection={() =>
                setCorrectionTarget({
                  type: "LESSON",
                  id: selectedLesson.id,
                  label: `Leçon ${selectedLesson.position ?? ""} · ${selectedLesson.title}`,
                  suggestedField: selectedLesson.changedFields.find(
                    (field) => field !== "module",
                  ),
                })
              }
              onRemoveCorrection={draft.remove}
              previous={
                selectedIndex > 0 ? playableLessons[selectedIndex - 1] : null
              }
              next={
                selectedIndex >= 0 && selectedIndex < playableLessons.length - 1
                  ? playableLessons[selectedIndex + 1]
                  : null
              }
              onSelect={(lesson) => void setLessonParam(lesson.id)}
            />
          ) : (
            <Card className="border-border/60 shadow-none">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Cette version ne contient encore aucune leçon.
              </CardContent>
            </Card>
          )}

          {isRevision && courseEntries.length > 0 ? (
            <CourseChangesCard entries={courseEntries} />
          ) : null}

          <CourseSheetCard preview={preview} />
        </div>

        <ProgramPanel
          modules={preview.modules}
          isRevision={isRevision}
          onlyChanges={isRevision && onlyChanges}
          selectedLessonId={selectedLesson?.id ?? null}
          corrections={draft.items}
          canAddCorrection={canDecide}
          onSelect={(lesson) => void setLessonParam(lesson.id)}
          onAddModuleCorrection={(courseModule) =>
            setCorrectionTarget({
              type: "MODULE",
              id: courseModule.id,
              label: `Module ${courseModule.position ?? ""} · ${courseModule.title}`,
              suggestedField: courseModule.changedFields[0],
            })
          }
        />
      </div>

      <AddCorrectionDialog
        target={correctionTarget}
        onOpenChange={(open) => {
          if (!open) setCorrectionTarget(null);
        }}
        onAdd={draft.add}
      />
      {dialog}
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "info" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        tone === "warning"
          ? "border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300"
          : "border-primary/30 bg-primary/5 text-foreground",
      )}
    >
      <HugeiconsIcon
        icon={tone === "warning" ? Alert02Icon : GitCompareIcon}
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "warning" ? "text-amber-600" : "text-primary",
        )}
        size={16}
        strokeWidth={1.5}
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function RevisionSummary({ preview }: { preview: AdminCoursePreview }) {
  const revision = preview.revision!;
  const counts = { ADDED: 0, UPDATED: 0, REMOVED: 0 };
  for (const entry of preview.entries) counts[entry.change] += 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline" className="text-xs">
          {revision.changeKind === "CONTENT"
            ? "Changement de contenu"
            : "Modifications mineures"}
        </Badge>
        {(["ADDED", "UPDATED", "REMOVED"] as const).map((change) =>
          counts[change] > 0 ? (
            <span
              key={change}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <ChangeMark change={change} />
              {counts[change]} {CHANGE_STYLES[change].label.toLowerCase()}
              {counts[change] > 1 ? "s" : ""}
            </span>
          ) : null,
        )}
        {revision.notifyLearners ? (
          <Badge
            variant="outline"
            className="border-primary/40 text-xs text-primary"
          >
            Apprenants prévenus à la publication
          </Badge>
        ) : null}
      </div>
      {revision.liveChangedSinceSubmission ? (
        <Notice tone="warning">
          La version en ligne a changé depuis l’envoi de cette mise à jour. Les
          différences affichées sont recalculées sur la version actuelle.
        </Notice>
      ) : null}
    </div>
  );
}

function LessonView({
  lesson,
  moduleTitle,
  isRevision,
  version,
  courseId,
  corrections,
  canAddCorrection,
  onAddCorrection,
  onRemoveCorrection,
  previous,
  next,
  onSelect,
}: {
  lesson: PreviewLesson;
  moduleTitle: string | null;
  isRevision: boolean;
  version: AdminCoursePreview["version"];
  courseId: string;
  corrections: ReviewCorrectionDraft[];
  canAddCorrection: boolean;
  onAddCorrection: () => void;
  onRemoveCorrection: (key: string) => void;
  previous: PreviewLesson | null;
  next: PreviewLesson | null;
  onSelect: (lesson: PreviewLesson) => void;
}) {
  const compareVideos = isRevision && lesson.previousVideo;
  const fields = lesson.changedFields.filter((field) => field !== "video");

  return (
    <div className="space-y-4">
      {lesson.change === "REMOVED" ? (
        <Notice tone="warning">
          Cette leçon sera retirée par la mise à jour. Elle reste affichée ici
          pour que vous voyiez ce qui disparaît.
        </Notice>
      ) : null}

      {compareVideos ? (
        <div className="grid gap-3 md:grid-cols-2">
          <figure className="space-y-2">
            <figcaption className="text-xs font-semibold text-muted-foreground">
              Vidéo en ligne actuellement
            </figcaption>
            <VideoStage video={lesson.previousVideo} title={lesson.title} />
          </figure>
          <figure className="space-y-2">
            <figcaption className="text-xs font-semibold text-primary">
              {lesson.video ? "Vidéo proposée" : "Vidéo retirée par la mise à jour"}
            </figcaption>
            <VideoStage video={lesson.video} title={lesson.title} />
          </figure>
        </div>
      ) : (
        <VideoStage video={lesson.video} title={lesson.title} />
      )}

      <Card className="border-border/60 shadow-none">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {lesson.position ? `Leçon ${lesson.position}` : "Leçon retirée"}
              {moduleTitle ? ` · ${moduleTitle}` : null}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={!previous}
                onClick={() => previous && onSelect(previous)}
                aria-label="Leçon précédente"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" size={16} strokeWidth={1.5} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={!next}
                onClick={() => next && onSelect(next)}
                aria-label="Leçon suivante"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" size={16} strokeWidth={1.5} />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-sora text-lg font-semibold">
              {lesson.title}
            </CardTitle>
            <ChangeBadge change={lesson.change} />
            {lesson.isPreview ? (
              <Badge variant="secondary" className="text-[11px]">
                Aperçu gratuit
              </Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{formatSeconds(lesson.durationSeconds)}</span>
            <span>{videoState(lesson.video).label}</span>
            {fields.length > 0 ? (
              <span className="text-primary">
                Modifié : {fields.map((field) => reviewFieldLabel(field)).join(", ")}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {lesson.description ? (
            <p className="whitespace-pre-line text-sm leading-6 text-foreground">
              {lesson.description}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Aucune description pour cette leçon.
            </p>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Ressources</h3>
            {lesson.assets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune ressource.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {lesson.assets.map((asset) => {
                  const href = asset.downloadable
                    ? `/api/admin/courses/${courseId}/preview-assets/${encodeURIComponent(asset.id)}?version=${version}`
                    : asset.url;
                  const size = formatFileSize(asset.fileSize);
                  return (
                    <li key={asset.id}>
                      <a
                        href={href ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                          !href && "pointer-events-none opacity-60",
                        )}
                      >
                        <HugeiconsIcon
                          icon={
                            asset.type === "LINK"
                              ? LinkSquare02Icon
                              : asset.type === "PDF"
                                ? Pdf01Icon
                                : File01Icon
                          }
                          className="size-4 shrink-0 text-muted-foreground"
                          size={16}
                          strokeWidth={1.5}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {asset.title}
                          </span>
                          {size || asset.fileName ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {[asset.fileName, size].filter(Boolean).join(" · ")}
                            </span>
                          ) : null}
                        </span>
                        <HugeiconsIcon
                          icon={asset.type === "LINK" ? LinkSquare02Icon : Download01Icon}
                          className="size-4 shrink-0 text-muted-foreground"
                          size={16}
                          strokeWidth={1.5}
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {canAddCorrection || corrections.length > 0 ? (
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Vos corrections</h3>
                {canAddCorrection ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={onAddCorrection}
                  >
                    <HugeiconsIcon icon={MessageAdd01Icon} className="size-4" size={16} strokeWidth={1.5} />
                    Ajouter une correction
                  </Button>
                ) : null}
              </div>
              {corrections.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Notez ce que le formateur doit reprendre sur cette leçon. Les
                  corrections partent avec votre décision.
                </p>
              ) : (
                <ul className="space-y-2">
                  {corrections.map((item) => (
                    <CorrectionRow
                      key={item.key}
                      item={item}
                      onRemove={() => onRemoveCorrection(item.key)}
                    />
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function CorrectionRow({
  item,
  onRemove,
}: {
  item: ReviewCorrectionDraft;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-amber-800 dark:text-amber-300">
          {item.label}
        </span>
        <span className="block whitespace-pre-line">{item.message}</span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={`Retirer la correction « ${item.label} »`}
        onClick={onRemove}
      >
        <HugeiconsIcon icon={Delete02Icon} className="size-4" size={16} strokeWidth={1.5} />
      </Button>
    </li>
  );
}

function CourseChangesCard({ entries }: { entries: AdminCourseRevisionEntry[] }) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Fiche de la formation · {entries.length} changement
          {entries.length > 1 ? "s" : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.code} className="space-y-2 rounded-lg border border-border/60 p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ChangeMark change={entry.change} />
              {entry.label}
              <span className="font-normal text-muted-foreground">
                · {entry.detail}
              </span>
            </p>
            {entry.before != null || entry.after != null ? (
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <ValueBox label="En ligne" value={entry.before} />
                <ValueBox label="Proposé" value={entry.after} highlight />
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


function CourseSheetCard({ preview }: { preview: AdminCoursePreview }) {
  const { course } = preview;
  const lists: Array<[string, string[]]> = [
    ["Ce que l’apprenant va apprendre", course.benefits],
    ["Prérequis", course.prerequisites],
    ["Public visé", course.targetAudience],
  ];

  return (
    <Card className="border-border/60 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Présentation de la formation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {course.promoVideo ? (
          <div className="max-w-xl space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Vidéo de présentation
            </p>
            <VideoStage video={course.promoVideo} title={course.title} />
          </div>
        ) : null}
        {course.subtitle ? (
          <p className="text-sm font-medium">{course.subtitle}</p>
        ) : null}
        <p className="whitespace-pre-line text-sm leading-6 text-foreground">
          {course.description || (
            <span className="italic text-muted-foreground">
              Aucune description.
            </span>
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {lists.map(([title, values]) => (
            <div key={title} className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">{title}</p>
              {values.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">Non renseigné</p>
              ) : (
                <ul className="list-disc space-y-1 pl-4 text-sm">
                  {values.map((value, index) => (
                    <li key={`${title}-${index}`}>{value}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Modules et lecons modifies ; un module ajoute ou retire reste entier. */
function filterChangedModules(modules: PreviewModule[]): PreviewModule[] {
  return modules
    .map((courseModule) =>
      courseModule.change === "ADDED" || courseModule.change === "REMOVED"
        ? courseModule
        : {
            ...courseModule,
            lessons: courseModule.lessons.filter((lesson) => lesson.change),
          },
    )
    .filter(
      (courseModule) => courseModule.change || courseModule.lessons.length > 0,
    );
}

function ProgramPanel({
  modules,
  isRevision,
  onlyChanges,
  selectedLessonId,
  corrections,
  canAddCorrection,
  onSelect,
  onAddModuleCorrection,
}: {
  modules: PreviewModule[];
  isRevision: boolean;
  onlyChanges: boolean;
  selectedLessonId: string | null;
  corrections: ReviewCorrectionDraft[];
  canAddCorrection: boolean;
  onSelect: (lesson: PreviewLesson) => void;
  onAddModuleCorrection: (courseModule: PreviewModule) => void;
}) {
  const correctionCount = (id: string) =>
    corrections.filter((item) => item.targetId === id).length;

  const visibleModules = onlyChanges ? filterChangedModules(modules) : modules;

  return (
    <aside className="rounded-xl border border-border/60 bg-card lg:sticky lg:top-20">
      <div className="border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold">Programme</h2>
        {onlyChanges ? (
          <p className="text-xs text-muted-foreground">
            Seuls les éléments modifiés sont affichés.
          </p>
        ) : null}
      </div>
      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-2">
        {visibleModules.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            {onlyChanges ? "Aucun changement dans le programme." : "Programme vide."}
          </p>
        ) : null}
        {visibleModules.map((courseModule) => {
          const moduleCorrections = correctionCount(courseModule.id);
          return (
            <section key={courseModule.id} className="mb-2 last:mb-0">
              <div
                className={cn(
                  "group flex items-start gap-2 rounded-lg px-2 py-2",
                  courseModule.change && "border-l-2 pl-2.5",
                  courseModule.change && CHANGE_STYLES[courseModule.change].row,
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {courseModule.position
                      ? `Module ${courseModule.position}`
                      : "Module retiré"}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold leading-snug",
                      courseModule.change === "REMOVED" && "line-through decoration-destructive/60",
                    )}
                  >
                    {courseModule.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {isRevision ? <ChangeBadge change={courseModule.change} /> : null}
                    {moduleCorrections > 0 ? (
                      <Badge variant="outline" className="border-amber-500/40 text-[11px] text-amber-700 dark:text-amber-300">
                        {moduleCorrections} correction{moduleCorrections > 1 ? "s" : ""}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                {canAddCorrection && courseModule.change !== "REMOVED" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground"
                    aria-label={`Ajouter une correction sur le module ${courseModule.title}`}
                    onClick={() => onAddModuleCorrection(courseModule)}
                  >
                    <HugeiconsIcon icon={MessageAdd01Icon} className="size-4" size={16} strokeWidth={1.5} />
                  </Button>
                ) : null}
              </div>

              <ul className="space-y-0.5">
                {courseModule.lessons.map((lesson) => {
                  const selected = lesson.id === selectedLessonId;
                  const state = videoState(lesson.video);
                  const lessonCorrections = correctionCount(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(lesson)}
                        aria-current={selected ? "true" : undefined}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
                          selected && "bg-primary/10 hover:bg-primary/10",
                        )}
                      >
                        {isRevision && lesson.change ? (
                          <ChangeMark change={lesson.change} />
                        ) : (
                          <span
                            aria-hidden
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              state.tone === "ready" && "bg-emerald-500",
                              state.tone === "pending" && "bg-amber-500",
                              state.tone === "error" && "bg-destructive",
                              state.tone === "muted" && "bg-muted-foreground/40",
                            )}
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate",
                              selected && "font-semibold",
                              lesson.change === "REMOVED" && "text-muted-foreground line-through",
                            )}
                          >
                            {lesson.position ? `${lesson.position} · ` : ""}
                            {lesson.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {formatSeconds(lesson.durationSeconds)}
                            {state.tone !== "ready" ? ` · ${state.label}` : ""}
                          </span>
                        </span>
                        {lessonCorrections > 0 ? (
                          <Badge variant="outline" className="h-5 border-amber-500/40 px-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                            {lessonCorrections}
                          </Badge>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </aside>
  );
}

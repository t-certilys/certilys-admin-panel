"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  CheckmarkSquare01Icon,
  EyeIcon,
  MessageLock01Icon,
  Notification01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  AdminCoursePendingRevision,
  AdminCourseRevisionEntry,
} from "@/lib/courses/course-review.types";
import { formatDate } from "@/lib/mock/admin-courses-data";

import { ChangeMark, ValueBox } from "./review/review-ui";
import { useReviewDecisionFlow } from "./review/use-review-decision-flow";

interface CoursePendingRevisionCardProps {
  courseId: string;
  revision: AdminCoursePendingRevision;
  onReviewed: () => void;
}

/**
 * Examen d'une mise a jour sur une formation deja publiee.
 *
 * La decision porte sur la revision, jamais sur la formation elle-meme :
 * refuser une mise a jour ne depublie pas le cours que des apprenants ont
 * deja paye, ce que les libelles rappellent explicitement.
 */
export function CoursePendingRevisionCard({
  courseId,
  revision,
  onReviewed,
}: CoursePendingRevisionCardProps) {
  const { openDecision, dialog, draft } = useReviewDecisionFlow({
    courseId,
    revisionId: revision.id,
    onDone: onReviewed,
  });

  if (revision.status !== "SUBMITTED") return null;

  const previewHref = `/dashboard/courses/${courseId}/preview?version=revision`;

  return (
    <Card className="border-primary/40 shadow-none">
      <CardHeader className="gap-3 pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
          <HugeiconsIcon icon={RefreshIcon} className="size-4 text-primary" />
          Mise à jour en attente
          <Badge variant="outline" className="px-2.5 py-1 text-xs font-medium">
            {revision.entries.length > 1
              ? `${revision.entries.length} modifications`
              : "1 modification"}
          </Badge>
          <Badge variant="outline" className="px-2.5 py-1 text-xs font-medium">
            {revision.changeKind === "CONTENT"
              ? "Changement de contenu"
              : "Modifications mineures"}
          </Badge>
          {revision.notifyLearners ? (
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/40 px-2.5 py-1 text-xs font-medium text-primary"
            >
              <HugeiconsIcon icon={Notification01Icon} className="size-3" />
              Apprenants à prévenir
            </Badge>
          ) : null}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Envoyée le {formatDate(revision.submittedAt)}. La formation reste en
          ligne et vendable pendant l’examen.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {revision.liveChangedSinceSubmission ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            <HugeiconsIcon icon={Alert02Icon} className="mt-0.5 size-4 shrink-0" />
            La version en ligne a changé depuis l’envoi. Les différences
            ci-dessous sont recalculées sur la version actuelle.
          </div>
        ) : null}

        <ul className="space-y-1.5">
          {revision.entries.map((entry) => (
            <RevisionEntryRow
              key={entry.code}
              entry={entry}
              previewHref={previewHref}
            />
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="secondary" className="gap-2">
            <Link href={previewHref}>
              <HugeiconsIcon icon={EyeIcon} className="size-4" />
              Examiner comme un apprenant
            </Link>
          </Button>
          <Button type="button" size="sm" onClick={() => openDecision("approve")}>
            <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4" />
            Publier la mise à jour
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => openDecision("request-changes")}
          >
            <HugeiconsIcon icon={MessageLock01Icon} className="size-4" />
            Demander des corrections
            {draft.items.length > 0 ? (
              <Badge className="ml-0.5 h-5 min-w-5 px-1.5 text-[11px]">
                {draft.items.length}
              </Badge>
            ) : null}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-destructive"
            onClick={() => openDecision("reject")}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            Refuser
          </Button>
        </div>
      </CardContent>

      {dialog}
    </Card>
  );
}

function RevisionEntryRow({
  entry,
  previewHref,
}: {
  entry: AdminCourseRevisionEntry;
  previewHref: string;
}) {
  const lessonHref =
    entry.target?.type === "LESSON" && entry.target.id
      ? `${previewHref}&lesson=${encodeURIComponent(entry.target.id)}`
      : entry.target?.type === "MODULE"
        ? `${previewHref}&changes=true`
        : null;
  const comparable =
    entry.target?.type !== "LESSON" ||
    (entry.target.field !== "video" && entry.target.field !== "resources");
  const hasValues =
    comparable && (entry.before != null || entry.after != null);

  const content = (
    <>
      <ChangeMark change={entry.change} />
      <span className="min-w-0 flex-1">
        <strong className="font-semibold">{entry.label}</strong>
        {entry.detail ? ` · ${entry.detail}` : null}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">{entry.meta}</span>
    </>
  );

  if (hasValues) {
    return (
      <li className="rounded-lg border border-border/60 text-sm">
        <Collapsible>
          <CollapsibleTrigger className="group flex min-h-10 w-full items-center gap-2.5 px-3 py-2 text-left">
            {content}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
            <ValueBox label="En ligne" value={entry.before} />
            <ValueBox label="Proposé" value={entry.after} highlight />
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  if (lessonHref) {
    return (
      <li>
        <Link
          href={lessonHref}
          className="flex min-h-10 items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
        >
          {content}
          <HugeiconsIcon icon={EyeIcon} className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </li>
    );
  }

  return (
    <li className="flex min-h-10 items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2 text-sm">
      {content}
    </li>
  );
}

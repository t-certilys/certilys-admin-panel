"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkSquare01Icon,
  Cancel01Icon,
  MessageLock01Icon,
  Notification01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DecisionDialog } from "@/components/certilys-ui/dialogs";
import {
  approveAdminCourseRevisionAction,
  rejectAdminCourseRevisionAction,
  requestAdminCourseRevisionChangesAction,
  type AdminCoursePendingRevision,
} from "@/lib/admin-courses-actions";

type RevisionDecision = "approve" | "request-changes" | "reject";

const decisions: Record<
  RevisionDecision,
  {
    title: string;
    description: string;
    confirmLabel: string;
    requireReason: boolean;
    tone: "success" | "warning" | "danger";
  }
> = {
  approve: {
    title: "Publier la mise à jour",
    description:
      "Le nouveau contenu remplace la version en ligne. La progression des apprenants déjà inscrits est conservée.",
    confirmLabel: "Publier la mise à jour",
    requireReason: false,
    tone: "success",
  },
  "request-changes": {
    title: "Demander des corrections",
    description:
      "La mise à jour retourne au formateur. La version actuellement en ligne reste inchangée.",
    confirmLabel: "Demander des corrections",
    requireReason: true,
    tone: "warning",
  },
  reject: {
    title: "Refuser la mise à jour",
    description:
      "La mise à jour est abandonnée. La version actuellement en ligne reste inchangée.",
    confirmLabel: "Refuser la mise à jour",
    requireReason: true,
    tone: "danger",
  },
};

const changeMarks = {
  ADDED: { symbol: "+", className: "bg-emerald-500/10 text-emerald-700" },
  REMOVED: { symbol: "−", className: "bg-destructive/10 text-destructive" },
  UPDATED: { symbol: "~", className: "bg-primary/10 text-primary" },
} as const;

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
  const [decision, setDecision] = React.useState<RevisionDecision | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (revision.status !== "SUBMITTED") return null;

  const config = decision ? decisions[decision] : null;

  async function handleConfirm({ reason }: { reason: string }) {
    if (!decision) return;
    setLoading(true);
    setError(null);

    try {
      if (decision === "approve") {
        await approveAdminCourseRevisionAction(courseId, revision.id, reason);
      } else if (decision === "request-changes") {
        await requestAdminCourseRevisionChangesAction(
          courseId,
          revision.id,
          reason,
        );
      } else {
        await rejectAdminCourseRevisionAction(courseId, revision.id, reason);
      }

      setDecision(null);
      onReviewed();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "La décision n’a pas pu être enregistrée.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/40 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
          <HugeiconsIcon icon={RefreshIcon} className="size-4 text-primary" />
          Mise à jour en attente
          <Badge
            variant="outline"
            className="gap-1.5 px-2.5 py-1 text-xs font-medium"
          >
            {revision.entries.length > 1
              ? `${revision.entries.length} modifications`
              : "1 modification"}
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
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          La formation reste en ligne et vendable pendant l’examen. Publier
          remplace son contenu par la version ci-dessous.
        </p>

        <ul className="space-y-1.5">
          {revision.entries.map((entry) => {
            const mark = changeMarks[entry.change];

            return (
              <li
                key={entry.code}
                className="flex min-h-10 items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded font-mono text-xs font-bold ${mark.className}`}
                >
                  {mark.symbol}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="font-semibold">{entry.label}</strong>
                  {entry.detail ? ` · ${entry.detail}` : null}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {entry.meta}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setDecision("approve")}
          >
            <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4" />
            Publier la mise à jour
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDecision("request-changes")}
          >
            <HugeiconsIcon icon={MessageLock01Icon} className="size-4" />
            Demander des corrections
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-destructive"
            onClick={() => setDecision("reject")}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            Refuser
          </Button>
        </div>
      </CardContent>

      {config ? (
        <DecisionDialog
          open
          onOpenChange={(open) => {
            if (!open && !loading) setDecision(null);
          }}
          title={config.title}
          description={config.description}
          tone={config.tone}
          requireReason={config.requireReason}
          reasonLabel="Motif communiqué au formateur"
          reasonPlaceholder="Expliquez ce qui doit être corrigé…"
          confirmLabel={config.confirmLabel}
          loading={loading}
          error={error}
          onConfirm={handleConfirm}
        />
      ) : null}
    </Card>
  );
}

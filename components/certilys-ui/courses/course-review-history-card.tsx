"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  CircleIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminReviewFeedback } from "@/lib/courses/course-review.types";
import { cn } from "@/lib/utils";

const DECISIONS: Record<
  AdminReviewFeedback["decision"],
  { label: string; className: string }
> = {
  APPROVED: {
    label: "Approuvée",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  CHANGES_REQUESTED: {
    label: "Corrections demandées",
    className: "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  REJECTED: {
    label: "Refusée",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Historique des decisions sur la formation et ses mises a jour, avec
 * l'avancement du formateur sur chaque correction demandee.
 */
export function CourseReviewHistoryCard({
  feedbacks,
}: {
  feedbacks: AdminReviewFeedback[];
}) {
  if (feedbacks.length === 0) return null;

  return (
    <Card className="border-border/60 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <HugeiconsIcon
            icon={Clock01Icon}
            className="size-4 shrink-0 text-primary"
            size={16}
            strokeWidth={1.5}
          />
          Historique des décisions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {feedbacks.map((feedback) => {
            const decision = DECISIONS[feedback.decision];
            return (
              <li
                key={feedback.id}
                className="space-y-2 border-l-2 border-border/70 pl-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className={cn("text-[11px]", decision.className)}>
                    {decision.label}
                  </Badge>
                  <span>
                    {feedback.revisionId ? "Mise à jour" : "Formation"}
                  </span>
                  <span>·</span>
                  <time dateTime={feedback.createdAt}>
                    {dateFormatter.format(new Date(feedback.createdAt))}
                  </time>
                  {feedback.createdBy?.displayName ? (
                    <>
                      <span>·</span>
                      <span>{feedback.createdBy.displayName}</span>
                    </>
                  ) : null}
                  {feedback.items.length > 0 ? (
                    <span className="ml-auto font-medium text-foreground">
                      {feedback.resolvedCount}/{feedback.items.length} traitée
                      {feedback.resolvedCount > 1 ? "s" : ""} par le formateur
                    </span>
                  ) : null}
                </div>

                {feedback.message ? (
                  <p className="whitespace-pre-line text-sm text-foreground">
                    {feedback.message}
                  </p>
                ) : null}

                {feedback.items.length > 0 ? (
                  <ul className="space-y-1.5">
                    {feedback.items.map((item) => (
                      <li key={item.id} className="flex items-start gap-2 text-sm">
                        <HugeiconsIcon
                          icon={item.resolvedAt ? CheckmarkCircle02Icon : CircleIcon}
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            item.resolvedAt ? "text-emerald-600" : "text-muted-foreground",
                          )}
                          size={16}
                          strokeWidth={1.5}
                          aria-label={item.resolvedAt ? "Traitée" : "À traiter"}
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-muted-foreground">
                            {item.targetLabel}
                          </span>
                          <span className="block whitespace-pre-line">{item.message}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

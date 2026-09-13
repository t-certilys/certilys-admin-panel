"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  approveAdminCourseAction,
  approveAdminCourseRevisionAction,
  rejectAdminCourseAction,
  rejectAdminCourseRevisionAction,
  requestAdminCourseChangesAction,
  requestAdminCourseRevisionChangesAction,
} from "@/lib/admin-courses-actions";
import { toReviewDecisionPayload } from "@/lib/courses/course-review-decision.schema";
import { useReviewCorrectionsDraft } from "@/lib/courses/use-review-corrections-draft";

import {
  ReviewDecisionDialog,
  type ReviewDecision,
} from "./review-decision-dialog";

const SUCCESS_MESSAGES: Record<
  "course" | "revision",
  Record<ReviewDecision, string>
> = {
  course: {
    approve: "Formation approuvée et mise en ligne.",
    "request-changes": "Corrections envoyées au formateur.",
    reject: "Formation refusée, le formateur est prévenu.",
  },
  revision: {
    approve: "Mise à jour publiée pour les apprenants.",
    "request-changes": "Corrections envoyées au formateur.",
    reject: "Mise à jour refusée, la version en ligne est conservée.",
  },
};

/**
 * Enchaine une decision : ouverture du dialogue, envoi, nettoyage des
 * corrections preparees et rechargement du dossier. Partage entre le dossier
 * et l'apercu apprenant, qui manipulent le meme brouillon de corrections.
 */
export function useReviewDecisionFlow({
  courseId,
  revisionId,
  onDone,
}: {
  courseId: string;
  /** Mise a jour examinee ; `null` pour la formation elle-meme. */
  revisionId: string | null;
  onDone: () => void;
}) {
  const scope = revisionId ? "revision" : "course";
  const draft = useReviewCorrectionsDraft(courseId, revisionId);
  const [decision, setDecision] = React.useState<ReviewDecision | null>(null);

  const dialog = decision ? (
    <ReviewDecisionDialog
      open
      onOpenChange={(open) => {
        if (!open) setDecision(null);
      }}
      decision={decision}
      scope={scope}
      corrections={draft.items}
      onCorrectionsChange={draft.replace}
      onSubmit={async (values) => {
        const payload = toReviewDecisionPayload(values);
        if (decision === "approve") {
          if (revisionId) {
            await approveAdminCourseRevisionAction(
              courseId,
              revisionId,
              payload.reason,
            );
          } else {
            await approveAdminCourseAction(courseId, payload.reason);
          }
        } else if (decision === "request-changes") {
          if (revisionId) {
            await requestAdminCourseRevisionChangesAction(
              courseId,
              revisionId,
              payload,
            );
          } else {
            await requestAdminCourseChangesAction(courseId, payload);
          }
        } else if (revisionId) {
          await rejectAdminCourseRevisionAction(courseId, revisionId, payload);
        } else {
          await rejectAdminCourseAction(courseId, payload);
        }

        draft.clear();
        toast.success(SUCCESS_MESSAGES[scope][decision]);
        setDecision(null);
        onDone();
      }}
    />
  ) : null;

  return { openDecision: setDecision, dialog, draft };
}

import { z } from "zod";

import { REVIEW_FIELDS_BY_TARGET } from "./course-review.types";

// Backend : src/courses/schemas/course-review-decision.schema.ts.
// Toute modification des limites ou des messages se fait des deux cotes.

export const REVIEW_REASON_MIN_LENGTH = 5;
export const REVIEW_REASON_MAX_LENGTH = 2000;
export const REVIEW_ITEM_MIN_LENGTH = 3;
export const REVIEW_ITEM_MAX_LENGTH = 1000;
export const REVIEW_ITEMS_MAX_COUNT = 100;

const targetTypeSchema = z.enum(["COURSE", "MODULE", "LESSON"], {
  errorMap: () => ({
    message:
      "Précisez si la correction porte sur la fiche, un module ou une leçon.",
  }),
});

export const reviewCorrectionMessageSchema = z
  .string({
    required_error: "Rédigez la correction attendue.",
    invalid_type_error: "Rédigez la correction attendue.",
  })
  .trim()
  .min(
    REVIEW_ITEM_MIN_LENGTH,
    `Chaque correction doit contenir au moins ${REVIEW_ITEM_MIN_LENGTH} caractères.`,
  )
  .max(
    REVIEW_ITEM_MAX_LENGTH,
    `Une correction ne peut pas dépasser ${REVIEW_ITEM_MAX_LENGTH} caractères.`,
  );

export const reviewCorrectionSchema = z
  .object({
    key: z.string(),
    targetType: targetTypeSchema,
    targetId: z.string().trim().min(1).max(120).optional(),
    field: z.string().optional(),
    label: z.string(),
    message: reviewCorrectionMessageSchema,
  })
  .superRefine((item, context) => {
    if (item.targetType !== "COURSE" && !item.targetId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetId"],
        message: "Précisez le module ou la leçon concerné.",
      });
    }
    if (
      item.field &&
      !REVIEW_FIELDS_BY_TARGET[item.targetType].includes(item.field)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["field"],
        message: "L’élément visé ne correspond pas à la cible de la correction.",
      });
    }
  });

/** Ajout d'une correction depuis l'apercu : seule la saisie est validee. */
export const addCorrectionFormSchema = z.object({
  field: z.string(),
  message: reviewCorrectionMessageSchema,
});

export type AddCorrectionFormValues = z.infer<typeof addCorrectionFormSchema>;

/**
 * Demande de corrections ou refus. Sans correction precise, le motif global
 * est obligatoire : le formateur doit toujours savoir quoi reprendre.
 */
export const reviewDecisionFormSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .max(
        REVIEW_REASON_MAX_LENGTH,
        `Le motif ne peut pas dépasser ${REVIEW_REASON_MAX_LENGTH} caractères.`,
      ),
    items: z
      .array(reviewCorrectionSchema)
      .max(
        REVIEW_ITEMS_MAX_COUNT,
        `Vous ne pouvez pas envoyer plus de ${REVIEW_ITEMS_MAX_COUNT} corrections à la fois.`,
      ),
  })
  .superRefine((value, context) => {
    const length = value.reason.length;
    if (
      length < REVIEW_REASON_MIN_LENGTH &&
      (length > 0 || value.items.length === 0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message:
          value.items.length === 0
            ? `Expliquez votre décision en au moins ${REVIEW_REASON_MIN_LENGTH} caractères, ou ajoutez une correction précise.`
            : `Le motif doit contenir au moins ${REVIEW_REASON_MIN_LENGTH} caractères.`,
      });
    }
  });

export type ReviewDecisionFormValues = z.infer<typeof reviewDecisionFormSchema>;

export const approvalFormSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(
      REVIEW_REASON_MAX_LENGTH,
      `La note ne peut pas dépasser ${REVIEW_REASON_MAX_LENGTH} caractères.`,
    ),
  items: z.array(reviewCorrectionSchema).max(0),
});

/** Corps envoye au backend, sans les champs d'affichage. */
export function toReviewDecisionPayload(values: ReviewDecisionFormValues) {
  const reason = values.reason.trim();
  return {
    ...(reason ? { reason } : {}),
    items: values.items.map((item) => ({
      targetType: item.targetType,
      ...(item.targetId ? { targetId: item.targetId } : {}),
      ...(item.field ? { field: item.field } : {}),
      message: item.message.trim(),
    })),
  };
}

export type ReviewDecisionPayload = ReturnType<typeof toReviewDecisionPayload>;

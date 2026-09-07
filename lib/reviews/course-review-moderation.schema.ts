import { z } from "zod";

// Backend : src/course-reviews/schemas/course-review.schema.ts.
export const courseReviewModerationSchema = z.object({
  reason: z.string({ required_error: "Le motif est obligatoire.", invalid_type_error: "Le motif est obligatoire." })
    .trim()
    .min(1, "Le motif est obligatoire.")
    .max(1000, "Le motif ne peut pas dépasser 1 000 caractères."),
}).strict();

export type CourseReviewModerationValues = z.infer<typeof courseReviewModerationSchema>;

/**
 * Types de l'examen des formations, alignes sur le contrat du backend.
 * Reference : certilys-backend/docs/plan-validation-formations-admin.md,
 * section « Contrat d'API livré par les phases 1 et 2 ».
 */

export type RevisionChange = "ADDED" | "UPDATED" | "REMOVED";

export type ReviewTargetType = "COURSE" | "MODULE" | "LESSON";

export type ReviewDecisionKind = "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";

export type AdminCourseRevisionEntry = {
  code: string;
  change: RevisionChange;
  severity: "MINOR" | "CONTENT";
  label: string;
  detail: string;
  meta: string;
  target?: { type: ReviewTargetType; id?: string; field?: string };
  before?: string | null;
  after?: string | null;
};

export type AdminCourseRevisionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "APPLIED"
  | "DISCARDED";

export type AdminCoursePendingRevision = {
  id: string;
  status: AdminCourseRevisionStatus;
  changeKind: "MINOR" | "CONTENT";
  entries: AdminCourseRevisionEntry[];
  requiresReview?: boolean;
  notifyLearners: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  updatedAt: string;
  liveChangedSinceSubmission?: boolean;
};

export type AdminCourseDraftRevision = {
  id: string;
  status: AdminCourseRevisionStatus;
  changeKind: "MINOR" | "CONTENT";
  updatedAt: string;
};

export type AdminReviewFeedbackItem = {
  id: string;
  targetType: ReviewTargetType;
  targetId: string | null;
  field: string | null;
  targetLabel: string;
  message: string;
  resolvedAt: string | null;
};

export type AdminReviewFeedback = {
  id: string;
  revisionId: string | null;
  decision: ReviewDecisionKind;
  message: string | null;
  createdAt: string;
  createdBy?: { id: string; displayName: string | null } | null;
  items: AdminReviewFeedbackItem[];
  resolvedCount: number;
};

export type PreviewVersion = "live" | "revision";

export type PreviewVideo = {
  assetId: string | null;
  status: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number;
  name: string | null;
};

export type PreviewAsset = {
  id: string;
  type: string;
  title: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  url: string | null;
  downloadable: boolean;
};

export type PreviewLesson = {
  id: string;
  position: string | null;
  title: string;
  description: string;
  durationSeconds: number;
  isPreview: boolean;
  change: RevisionChange | null;
  changedFields: string[];
  video: PreviewVideo | null;
  previousVideo: PreviewVideo | null;
  assets: PreviewAsset[];
};

export type PreviewModule = {
  id: string;
  position: number | null;
  title: string;
  description: string;
  change: RevisionChange | null;
  changedFields: string[];
  lessons: PreviewLesson[];
};

export type AdminCoursePreview = {
  version: PreviewVersion;
  course: {
    id: string;
    status: string;
    title: string;
    subtitle: string;
    description: string;
    categorySlug: string;
    level: string;
    language: string;
    price: number;
    currency: string;
    benefits: string[];
    prerequisites: string[];
    targetAudience: string[];
    thumbnailUrl: string | null;
    promoVideoId: string | null;
    instructor: {
      id: string;
      displayName: string | null;
      photoUrl: string | null;
    } | null;
    promoVideo: PreviewVideo | null;
    changedFields: string[];
    lessonsCount: number;
    totalDurationSeconds: number;
  };
  modules: PreviewModule[];
  revision: {
    id: string;
    status: AdminCourseRevisionStatus;
    changeKind: "MINOR" | "CONTENT";
    notifyLearners: boolean;
    submittedAt: string | null;
    reviewedAt: string | null;
    liveChangedSinceSubmission: boolean;
  } | null;
  entries: AdminCourseRevisionEntry[];
};

/** Correction preparee par l'administration avant l'envoi de sa decision. */
export type ReviewCorrectionDraft = {
  key: string;
  targetType: ReviewTargetType;
  targetId?: string;
  field?: string;
  /** Libelle d'affichage, le backend recalcule le libelle officiel. */
  label: string;
  message: string;
};

export const REVIEW_FIELD_LABELS: Record<string, string> = {
  title: "Titre",
  subtitle: "Sous-titre",
  description: "Description",
  category: "Catégorie",
  level: "Niveau",
  language: "Langue",
  price: "Tarif",
  thumbnail: "Miniature",
  promoVideo: "Vidéo de présentation",
  benefits: "Objectifs",
  prerequisites: "Prérequis",
  targetAudience: "Public visé",
  program: "Programme",
  video: "Vidéo",
  resources: "Ressources",
  preview: "Aperçu gratuit",
  module: "Module",
};

export const REVIEW_FIELDS_BY_TARGET: Record<ReviewTargetType, string[]> = {
  COURSE: [
    "title",
    "subtitle",
    "description",
    "category",
    "level",
    "language",
    "price",
    "thumbnail",
    "promoVideo",
    "benefits",
    "prerequisites",
    "targetAudience",
    "program",
  ],
  MODULE: ["title", "description"],
  LESSON: ["title", "description", "video", "resources", "preview"],
};

export function reviewFieldLabel(field: string | null | undefined) {
  if (!field) return null;
  return REVIEW_FIELD_LABELS[field] ?? field;
}

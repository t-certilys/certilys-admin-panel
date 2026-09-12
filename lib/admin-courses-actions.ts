"use server";

import { adminDelete, adminGet, adminMutation, AdminApiError } from "@/lib/admin-api";
import type {
  AdminCourseSubmission,
  CourseAssetType,
  CourseSubmissionStatus,
} from "@/lib/mock/admin-courses-data";

type BackendCourseStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REJECTED"
  | "PUBLISHED"
  | "ARCHIVED";

type BackendVideoStatus =
  | "PENDING_UPLOAD"
  | "UPLOADING"
  | "PROCESSING"
  | "READY"
  | "FAILED";

type BackendCourse = {
  id: string;
  instructorId: string;
  instructor?: {
    displayName?: string | null;
    username?: string | null;
    title?: string | null;
    mainSpecialty?: string | null;
    photoUrl?: string | null;
    contactEmail?: string | null;
    isValidated?: boolean;
    user?: {
      email?: string | null;
      displayName?: string | null;
      avatarUrl?: string | null;
    } | null;
  } | null;
  title: string;
  slug: string;
  subtitle?: string | null;
  categoryId: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language: string;
  price: number;
  currency: "XOF" | "EUR" | "USD";
  description: string;
  benefits: string[];
  prerequisites: string[];
  targetAudience: string[];
  thumbnailUrl?: string | null;
  promoVideo?: {
    playbackUrl?: string | null;
    embedUrl?: string | null;
  } | null;
  status: BackendCourseStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  rejectionReason?: string | null;
  pendingRevision?: {
    id: string;
    changeKind: "MINOR" | "CONTENT";
    submittedAt: string | null;
  } | null;
  modules: Array<{
    id: string;
    title: string;
    lessons: BackendCourseLesson[];
  }>;
};

/** Mise a jour en attente sur une formation deja en ligne. */
export type AdminCourseRevisionEntry = {
  code: string;
  change: "ADDED" | "UPDATED" | "REMOVED";
  severity: "MINOR" | "CONTENT";
  label: string;
  detail: string;
  meta: string;
};

export type AdminCoursePendingRevision = {
  id: string;
  status: "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "REJECTED";
  changeKind: "MINOR" | "CONTENT";
  entries: AdminCourseRevisionEntry[];
  notifyLearners: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  updatedAt: string;
};

type BackendCourseLesson = {
  id: string;
  title: string;
  durationSeconds: number;
  isPreview: boolean;
  videoStatus: BackendVideoStatus;
  videoPlaybackUrl?: string | null;
  videoEmbedUrl?: string | null;
  assets: Array<{
    id: string;
    type: string;
    title: string;
    url?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
  }>;
};

type CourseListResponse = {
  courses: BackendCourse[];
};

type CourseResponse = {
  course: BackendCourse;
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
] as const;

export async function getAdminCoursesAction(
  status?: string,
): Promise<AdminCourseSubmission[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await adminGet<CourseListResponse>(`/admin/courses${query}`);
  return response.courses.map(mapCourse);
}

export async function getAdminCourseAction(
  id: string,
): Promise<AdminCourseSubmission | null> {
  const result = await getAdminCourseWithRevisionAction(id);
  return result?.course ?? null;
}

/**
 * Charge la formation et, le cas echeant, la mise a jour que le formateur a
 * envoyee en validation sans toucher a la version en ligne.
 */
export async function getAdminCourseWithRevisionAction(id: string): Promise<{
  course: AdminCourseSubmission;
  pendingRevision: AdminCoursePendingRevision | null;
} | null> {
  try {
    const response = await adminGet<
      CourseResponse & { pendingRevision?: AdminCoursePendingRevision | null }
    >(`/admin/courses/${encodeURIComponent(id)}`);
    return {
      course: mapCourse(response.course),
      pendingRevision: response.pendingRevision ?? null,
    };
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function approveAdminCourseRevisionAction(
  courseId: string,
  revisionId: string,
  notes?: string,
): Promise<AdminCourseSubmission> {
  const trimmedNotes = notes?.trim();
  const response = await adminMutation<CourseResponse>(
    `/admin/courses/${encodeURIComponent(courseId)}/revisions/${encodeURIComponent(revisionId)}/approve`,
    trimmedNotes ? { notes: trimmedNotes } : {},
  );
  return mapCourse(response.course);
}

export async function requestAdminCourseRevisionChangesAction(
  courseId: string,
  revisionId: string,
  reason: string,
): Promise<AdminCourseSubmission> {
  const response = await adminMutation<CourseResponse>(
    `/admin/courses/${encodeURIComponent(courseId)}/revisions/${encodeURIComponent(revisionId)}/request-changes`,
    { reason: reason.trim() },
  );
  return mapCourse(response.course);
}

export async function rejectAdminCourseRevisionAction(
  courseId: string,
  revisionId: string,
  reason: string,
): Promise<AdminCourseSubmission> {
  const response = await adminMutation<CourseResponse>(
    `/admin/courses/${encodeURIComponent(courseId)}/revisions/${encodeURIComponent(revisionId)}/reject`,
    { reason: reason.trim() },
  );
  return mapCourse(response.course);
}

export async function approveAdminCourseAction(
  id: string,
  notes?: string,
): Promise<AdminCourseSubmission> {
  const trimmedNotes = notes?.trim();
  const response = await adminMutation<CourseResponse>(
    `/admin/courses/${encodeURIComponent(id)}/approve`,
    trimmedNotes ? { notes: trimmedNotes } : {},
  );
  return mapCourse(response.course);
}

export async function rejectAdminCourseAction(
  id: string,
  reason: string,
): Promise<AdminCourseSubmission> {
  const response = await adminMutation<CourseResponse>(
    `/admin/courses/${encodeURIComponent(id)}/reject`,
    { reason: reason.trim() },
  );
  return mapCourse(response.course);
}

export async function requestAdminCourseChangesAction(
  id: string,
  reason: string,
): Promise<AdminCourseSubmission> {
  const response = await adminMutation<CourseResponse>(
    `/admin/courses/${encodeURIComponent(id)}/request-changes`,
    { reason: reason.trim() },
  );
  return mapCourse(response.course);
}

export async function archiveAdminCourseAction(
  id: string,
): Promise<AdminCourseSubmission> {
  const response = await adminMutation<CourseResponse>(
    `/admin/courses/${encodeURIComponent(id)}/archive`,
  );
  return mapCourse(response.course);
}

export async function restoreAdminCourseAction(
  id: string,
): Promise<AdminCourseSubmission> {
  const response = await adminMutation<CourseResponse>(
    `/admin/courses/${encodeURIComponent(id)}/restore`,
  );
  return mapCourse(response.course);
}

export async function deleteAdminCourseAction(id: string): Promise<void> {
  await adminDelete<{ status: "COURSE_DELETED"; courseId: string }>(
    `/admin/courses/${encodeURIComponent(id)}`,
  );
}

function mapCourse(course: BackendCourse): AdminCourseSubmission {
  const instructorName =
    course.instructor?.displayName?.trim() ||
    course.instructor?.user?.displayName?.trim() ||
    course.instructor?.username?.trim() ||
    "Formateur Certilys";
  const instructorEmail =
    course.instructor?.contactEmail?.trim() ||
    course.instructor?.user?.email?.trim() ||
    "email-non-renseigne@certilys.local";
  const modules = course.modules.map((courseModule) => ({
    id: courseModule.id,
    title: courseModule.title,
    lessons: courseModule.lessons.map(mapLesson),
  }));
  const lessons = modules.flatMap((courseModule) => courseModule.lessons);

  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle ?? null,
    slug: course.slug,
    status: mapStatus(course.status),
    instructorId: course.instructorId,
    instructorName,
    instructorEmail,
    instructorApproved: Boolean(course.instructor?.isValidated),
    instructorInitials: getInitials(instructorName),
    instructorAvatarColor: pickAvatarColor(instructorName),
    category: labelFromSlug(course.categoryId),
    level: course.level,
    language: course.language.toUpperCase(),
    price: course.price,
    currency: course.currency,
    promoPrice: null,
    description: course.description,
    learningOutcomes: course.benefits,
    prerequisites: course.prerequisites,
    targetAudience: course.targetAudience,
    thumbnailUrl: course.thumbnailUrl ?? null,
    promoVideoUrl:
      course.promoVideo?.playbackUrl ?? course.promoVideo?.embedUrl ?? null,
    modules,
    submittedAt: course.submittedAt ?? null,
    lastDecisionAt: course.reviewedAt ?? null,
    lastDecisionReason: course.rejectionReason ?? course.reviewNotes ?? null,
    totalLessons: lessons.length,
    totalDurationMinutes: lessons.reduce(
      (sum, lesson) => sum + lesson.durationMinutes,
      0,
    ),
    pendingRevisionSubmittedAt: course.pendingRevision
      ? (course.pendingRevision.submittedAt ?? course.submittedAt ?? null)
      : null,
  };
}

function mapLesson(lesson: BackendCourseLesson) {
  return {
    id: lesson.id,
    title: lesson.title,
    durationMinutes: Math.max(0, Math.ceil(lesson.durationSeconds / 60)),
    isFreePreview: lesson.isPreview,
    videoUrl: lesson.videoPlaybackUrl ?? lesson.videoEmbedUrl ?? null,
    videoStatus: mapVideoStatus(lesson.videoStatus),
    assets: lesson.assets.map((asset) => ({
      id: asset.id,
      type: mapAssetType(asset.type),
      title: asset.title,
      url: asset.url ?? undefined,
      fileName: asset.fileName ?? undefined,
      fileSizeBytes: asset.fileSize ?? undefined,
    })),
  };
}

function mapStatus(status: BackendCourseStatus): CourseSubmissionStatus {
  return status;
}

function mapVideoStatus(
  status: BackendVideoStatus,
): "READY" | "PROCESSING" | "MISSING" {
  if (status === "READY") return "READY";
  if (status === "FAILED") return "MISSING";
  return "PROCESSING";
}

function mapAssetType(value: string): CourseAssetType {
  if (value === "PDF" || value === "LINK" || value === "FILE") return value;
  return "FILE";
}

function labelFromSlug(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function pickAvatarColor(value: string) {
  const index =
    [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

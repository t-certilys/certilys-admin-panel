"use server";

import { AdminApiError, adminGet, adminPatch } from "@/lib/admin-api";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

async function reviewAction<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await run() };
  } catch (error) {
    return {
      success: false,
      error: error instanceof AdminApiError && error.status >= 400 && error.status < 500
        ? error.message
        : "Impossible de traiter les avis pour le moment. Veuillez réessayer.",
    };
  }
}

export type AdminCourseReview = {
  id: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  author: {
    displayName: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
  reply: {
    id: string;
    body: string;
    isHidden: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type AdminCourseReviewsResponse = {
  summary: {
    ratingAverage: number | null;
    ratingCount: number;
    commentCount: number;
    ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  };
  reviews: AdminCourseReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getAdminCourseReviewsAction(
  courseId: string,
  input: {
    q?: string;
    rating?: number;
    visibility?: "all" | "visible" | "hidden";
    page?: number;
    limit?: number;
  } = {},
) {
  const params = new URLSearchParams();
  if (input.q?.trim()) params.set("q", input.q.trim());
  if (input.rating) params.set("rating", String(input.rating));
  if (input.visibility) params.set("visibility", input.visibility);
  if (input.page) params.set("page", String(input.page));
  if (input.limit) params.set("limit", String(input.limit));
  const query = params.toString();
  return reviewAction(() => adminGet<AdminCourseReviewsResponse>(
    `/admin/courses/${encodeURIComponent(courseId)}/reviews${query ? `?${query}` : ""}`,
  ));
}

export async function setAdminCourseReviewVisibilityAction(
  courseId: string,
  reviewId: string,
  hidden: boolean,
  reason: string,
) {
  return reviewAction(() => adminPatch<{ review: AdminCourseReview }>(
    `/admin/courses/${encodeURIComponent(courseId)}/reviews/${encodeURIComponent(reviewId)}/visibility`,
    { hidden, reason: reason.trim() },
  ));
}

export async function setAdminCourseReviewReplyVisibilityAction(
  courseId: string,
  reviewId: string,
  hidden: boolean,
  reason: string,
) {
  return reviewAction(() => adminPatch<{ reply: AdminCourseReview["reply"] }>(
    `/admin/courses/${encodeURIComponent(courseId)}/reviews/${encodeURIComponent(reviewId)}/reply/visibility`,
    { hidden, reason: reason.trim() },
  ));
}

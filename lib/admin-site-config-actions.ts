"use server";

import {
  adminDelete,
  adminGet,
  adminMutation,
  adminPatch,
  adminPut,
  adminUpload,
} from "@/lib/admin-api";

export type VerifiedInstructorsSettings = {
  id: string | null;
  enabled: boolean;
  title: string;
  description: string;
  updatedAt: string | null;
};

export type FeaturedInstructorImageMode = "PROFILE" | "CUSTOM";

export type AdminFeaturedInstructor = {
  id: string;
  instructorId: string;
  displayName: string;
  username: string;
  profileExpertise: string;
  profileImageUrl: string | null;
  imageMode: FeaturedInstructorImageMode;
  customImageUrl: string | null;
  displayNameOverride: string | null;
  expertiseOverride: string | null;
  imageAlt: string | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

export type EligibleFeaturedInstructor = {
  id: string;
  displayName: string;
  username: string;
  expertise: string;
  photoUrl: string | null;
  email: string;
  isSelected: boolean;
};

type InstructorResponse = { instructor: AdminFeaturedInstructor };

export async function getVerifiedInstructorsSettingsAction() {
  return adminGet<VerifiedInstructorsSettings>(
    "/admin/site-config/verified-instructors/settings",
  );
}

export async function updateVerifiedInstructorsSettingsAction(input: {
  enabled: boolean;
  title: string;
  description: string;
}) {
  return adminPatch<VerifiedInstructorsSettings>(
    "/admin/site-config/verified-instructors/settings",
    input,
  );
}

export async function getFeaturedInstructorsAction() {
  const response = await adminGet<{ instructors: AdminFeaturedInstructor[] }>(
    "/admin/site-config/verified-instructors",
  );
  return response.instructors;
}

export async function getEligibleFeaturedInstructorsAction(q = "") {
  const search = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  const response = await adminGet<{
    instructors: EligibleFeaturedInstructor[];
  }>(`/admin/site-config/verified-instructors/eligible${search}`);
  return response.instructors;
}

export async function createFeaturedInstructorAction(input: {
  instructorId: string;
  displayNameOverride?: string;
  expertiseOverride?: string;
  imageAlt?: string;
}) {
  const response = await adminMutation<InstructorResponse>(
    "/admin/site-config/verified-instructors",
    input,
  );
  return response.instructor;
}

export async function updateFeaturedInstructorAction(
  id: string,
  input: {
    imageMode?: FeaturedInstructorImageMode;
    displayNameOverride?: string;
    expertiseOverride?: string;
    imageAlt?: string;
    isActive?: boolean;
  },
) {
  const response = await adminPatch<InstructorResponse>(
    `/admin/site-config/verified-instructors/${encodeURIComponent(id)}`,
    input,
  );
  return response.instructor;
}

export async function uploadFeaturedInstructorImageAction(
  id: string,
  image: File,
) {
  const body = new FormData();
  body.set("image", image);
  const response = await adminUpload<InstructorResponse>(
    `/admin/site-config/verified-instructors/${encodeURIComponent(id)}/image`,
    body,
  );
  return response.instructor;
}

export async function reorderFeaturedInstructorsAction(ids: string[]) {
  const response = await adminPut<{
    instructors: AdminFeaturedInstructor[];
  }>("/admin/site-config/verified-instructors/order", { ids });
  return response.instructors;
}

export async function deleteFeaturedInstructorAction(id: string) {
  await adminDelete(
    `/admin/site-config/verified-instructors/${encodeURIComponent(id)}`,
  );
}

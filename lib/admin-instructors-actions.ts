"use server";

import { adminGet, adminMutation, AdminApiError } from "@/lib/admin-api";
import type {
  InstructorApplication,
  InstructorApplicationStatus,
  VerificationPayload,
} from "@/lib/mock/admin-instructors-data";

type BackendInstructorApplication = {
  id: string;
  displayName?: string | null;
  username?: string | null;
  title?: string | null;
  mainSpecialty?: string | null;
  contactEmail?: string | null;
  applicationStatus: InstructorApplicationStatus;
  applicationSubmittedAt?: string | null;
  applicationReviewedAt?: string | null;
  applicationNotes?: string | null;
  verificationPayload?: VerificationPayload | null;
  publishedCoursesCount?: number;
  submittedCoursesCount?: number;
  documentAccess?: { endpoint: string; expiresInSeconds: number } | null;
};

type ApplicationResponse = {
  application: BackendInstructorApplication;
};

type ApplicationsResponse = {
  applications: BackendInstructorApplication[];
};

export async function getInstructorApplicationsAction(
  status?: string,
): Promise<InstructorApplication[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await adminGet<ApplicationsResponse>(
    `/admin/instructor-applications${query}`,
  );
  return response.applications.map(mapApplication);
}

export async function getInstructorApplicationAction(
  id: string,
): Promise<InstructorApplication | null> {
  try {
    const response = await adminGet<ApplicationResponse>(
      `/admin/instructor-applications/${encodeURIComponent(id)}`,
    );
    const application = mapApplication(response.application);
    if (response.application.documentAccess?.endpoint) {
      application.verificationPayload = withDocumentUrl(
        application.verificationPayload,
        `/api/admin/instructor-documents/${encodeURIComponent(
          response.application.id,
        )}`,
      );
    }
    return application;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function approveInstructorApplicationAction(
  id: string,
  notes?: string,
): Promise<InstructorApplication> {
  const trimmedNotes = notes?.trim();
  const response = await adminMutation<ApplicationResponse>(
    `/admin/instructor-applications/${encodeURIComponent(id)}/approve`,
    trimmedNotes ? { notes: trimmedNotes } : {},
  );
  return mapApplication(response.application);
}

export async function rejectInstructorApplicationAction(
  id: string,
  reason: string,
): Promise<InstructorApplication> {
  const response = await adminMutation<ApplicationResponse>(
    `/admin/instructor-applications/${encodeURIComponent(id)}/reject`,
    { reason: reason.trim() },
  );
  return mapApplication(response.application);
}

export async function requestInstructorChangesAction(
  id: string,
  requestedChanges: string,
): Promise<InstructorApplication> {
  const response = await adminMutation<ApplicationResponse>(
    `/admin/instructor-applications/${encodeURIComponent(id)}/request-changes`,
    { requestedChanges: requestedChanges.trim() },
  );
  return mapApplication(response.application);
}

function mapApplication(
  application: BackendInstructorApplication,
): InstructorApplication {
  const fullName =
    application.displayName?.trim() ||
    application.username?.trim() ||
    "Formateur Certilys";
  const verification = normalizeVerificationPayload(
    application.verificationPayload,
  );
  const completeness = {
    hasLegalIdentity: Boolean(
      verification?.legalStatus &&
        verification.legalLastName &&
        verification.legalFirstNames &&
        verification.nationality &&
        verification.birthDate,
    ),
    hasAddress: Boolean(
      verification?.addressLine &&
        verification.postalCode &&
        verification.city &&
        verification.residenceCountry,
    ),
    hasIdentityDocument: Boolean(verification?.identityDocument),
    hasHonorDeclaration: Boolean(verification?.honorDeclarationAccepted),
  };

  return {
    id: application.id,
    fullName,
    email: application.contactEmail || "email-non-renseigne@certilys.local",
    initials: getInitials(fullName),
    avatarColor: "bg-primary/15 text-primary",
    specialty:
      application.mainSpecialty ||
      application.title ||
      "Spécialité non renseignée",
    country: verification?.residenceCountry || "Pays non renseigné",
    status: application.applicationStatus,
    submittedAt: application.applicationSubmittedAt ?? null,
    coursesSubmitted:
      application.submittedCoursesCount ?? application.publishedCoursesCount ?? 0,
    isComplete:
      completeness.hasLegalIdentity &&
      completeness.hasAddress &&
      completeness.hasIdentityDocument &&
      completeness.hasHonorDeclaration,
    lastDecisionReason: application.applicationNotes ?? undefined,
    lastDecisionAt: application.applicationReviewedAt ?? undefined,
    verificationPayload: verification ?? undefined,
    verificationCompleteness: completeness,
  };
}

function normalizeVerificationPayload(
  payload?: VerificationPayload | null,
): VerificationPayload | null {
  if (!payload) return null;
  const document = payload.identityDocument
    ? {
        ...payload.identityDocument,
        fileName:
          payload.identityDocument.fileName ||
          fileNameFromUrl(payload.identityDocument.fileUrl),
        uploadedAt:
          payload.identityDocument.uploadedAt ||
          payload.honorDeclarationAcceptedAt,
      }
    : undefined;
  return { ...payload, identityDocument: document };
}

function withDocumentUrl(
  payload: VerificationPayload | undefined,
  fileUrl: string,
) {
  if (!payload?.identityDocument) return payload;
  return {
    ...payload,
    identityDocument: {
      ...payload.identityDocument,
      fileUrl,
    },
  };
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function fileNameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").pop() || "document-identite";
  } catch {
    return "document-identite";
  }
}

"use server";

import { adminDelete, adminGet, adminMutation, AdminApiError } from "@/lib/admin-api";
import type {
  InstructorApplication,
  InstructorApplicationStatus,
  IdentityDocument,
  VerificationPayload,
} from "@/lib/mock/admin-instructors-data";

type BackendInstructorApplication = {
  id: string;
  userId: string;
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
  isHiddenFromCatalog?: boolean;
  submittedCoursesCount?: number;
  documentAccess?: { endpoint: string; expiresInSeconds: number } | null;
  documentAccesses?: Array<{
    kind: "IDENTITY_DOCUMENT" | "ESTABLISHMENT_DECLARATION" | "COMPANY_IFU" | "TRADE_REGISTER";
    endpoint: string;
    expiresInSeconds: number;
  }>;
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
    application.verificationPayload = withDocumentUrls(
      application.verificationPayload,
      response.application.id,
      response.application.documentAccesses,
    );
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

export async function deleteInstructorAccountAction(id: string): Promise<void> {
  await adminDelete<{ status: "USER_DELETED"; userId: string }>(
    `/admin/instructor-applications/${encodeURIComponent(id)}/account`,
  );
}

export async function setInstructorCatalogVisibilityAction(
  id: string,
  hidden: boolean,
): Promise<InstructorApplication> {
  const response = await adminMutation<ApplicationResponse>(
    `/admin/instructor-applications/${encodeURIComponent(id)}/catalog-visibility`,
    { hidden },
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
  const isCompanyV2 =
    verification?.schemaVersion === 2 &&
    verification.legalStatus === "COMPANY";
  const completeness = {
    hasLegalIdentity: Boolean(
      isCompanyV2
        ? verification.companyLegalName && verification.nationality
        : verification?.legalStatus &&
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
    hasCompanyDocuments: Boolean(
      verification?.companyDocuments?.establishmentDeclaration &&
        verification.companyDocuments.companyIfu &&
        verification.companyDocuments.tradeRegister,
    ),
    hasHonorDeclaration: Boolean(verification?.honorDeclarationAccepted),
  };

  return {
    id: application.id,
    userId: application.userId,
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
      (isCompanyV2
        ? completeness.hasCompanyDocuments
        : completeness.hasIdentityDocument) &&
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
  const normalizeDocument = (item?: IdentityDocument) =>
    item
      ? {
          ...item,
          fileName: item.fileName || fileNameFromUrl(item.fileUrl),
          uploadedAt: item.uploadedAt || payload.honorDeclarationAcceptedAt,
        }
      : undefined;
  return {
    ...payload,
    identityDocument: normalizeDocument(document),
    companyDocuments: payload.companyDocuments
      ? {
          establishmentDeclaration: normalizeDocument(
            payload.companyDocuments.establishmentDeclaration,
          ),
          companyIfu: normalizeDocument(payload.companyDocuments.companyIfu),
          tradeRegister: normalizeDocument(
            payload.companyDocuments.tradeRegister,
          ),
        }
      : undefined,
  };
}

function withDocumentUrls(
  payload: VerificationPayload | undefined,
  applicationId: string,
  accesses?: BackendInstructorApplication["documentAccesses"],
) {
  if (!payload) return payload;
  const available = new Set(accesses?.map((access) => access.kind) ?? []);
  const proxyUrl = (kind: string) =>
    `/api/admin/instructor-documents/${encodeURIComponent(applicationId)}?kind=${encodeURIComponent(kind)}`;
  return {
    ...payload,
    identityDocument:
      payload.identityDocument &&
      (available.has("IDENTITY_DOCUMENT") || !accesses)
        ? { ...payload.identityDocument, fileUrl: proxyUrl("IDENTITY_DOCUMENT") }
        : payload.identityDocument,
    companyDocuments: payload.companyDocuments
      ? {
          establishmentDeclaration: payload.companyDocuments.establishmentDeclaration
            ? { ...payload.companyDocuments.establishmentDeclaration, fileUrl: proxyUrl("ESTABLISHMENT_DECLARATION") }
            : undefined,
          companyIfu: payload.companyDocuments.companyIfu
            ? { ...payload.companyDocuments.companyIfu, fileUrl: proxyUrl("COMPANY_IFU") }
            : undefined,
          tradeRegister: payload.companyDocuments.tradeRegister
            ? { ...payload.companyDocuments.tradeRegister, fileUrl: proxyUrl("TRADE_REGISTER") }
            : undefined,
        }
      : undefined,
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

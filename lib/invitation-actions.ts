"use server";

import { AdminApiError, adminGet, adminMutation } from "@/lib/admin-api";

export type InvitationActionResponse = {
  success: boolean;
  message: string;
  status?: "VALID" | "EXPIRED" | "ALREADY_ACCEPTED" | "REJECTED" | "INVALID";
};

export type InvitationDetails = {
  id: string;
  email: string;
  teamName: string;
  inviterName: string;
  expiresAt: string;
};

export async function getInvitationDetails(
  tokenOrId: string,
): Promise<InvitationActionResponse & { data?: InvitationDetails }> {
  try {
    return await adminGet<
      InvitationActionResponse & { data?: InvitationDetails }
    >(`/admin/invitations/resolve?token=${encodeURIComponent(tokenOrId)}`);
  } catch (error) {
    if (error instanceof AdminApiError) {
      return {
        success: false,
        status: invitationStatusFromErrorCode(error.code),
        message: error.message,
      };
    }

    return {
      success: false,
      status: "INVALID",
      message:
        error instanceof Error
          ? error.message
          : "Cette invitation n'existe pas ou a été supprimée.",
    };
  }
}

export async function acceptInvitation(
  tokenOrId: string,
): Promise<InvitationActionResponse> {
  try {
    return await adminMutation<InvitationActionResponse>(
      "/admin/invitations/accept",
      { token: tokenOrId },
    );
  } catch (error) {
    if (error instanceof AdminApiError) {
      return {
        success: false,
        status: invitationStatusFromErrorCode(error.code),
        message: error.message,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Action impossible : invitation non valide.",
    };
  }
}

export async function rejectInvitation(
  tokenOrId: string,
): Promise<InvitationActionResponse> {
  try {
    return await adminMutation<InvitationActionResponse>(
      "/admin/invitations/reject",
      { token: tokenOrId },
    );
  } catch (error) {
    if (error instanceof AdminApiError) {
      return {
        success: false,
        status: invitationStatusFromErrorCode(error.code),
        message: error.message,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Action impossible : invitation non valide.",
    };
  }
}

function invitationStatusFromErrorCode(
  code?: string,
): NonNullable<InvitationActionResponse["status"]> {
  if (code === "ADMIN_INVITATION_ALREADY_ACCEPTED") {
    return "ALREADY_ACCEPTED";
  }
  if (code === "ADMIN_INVITATION_EXPIRED") {
    return "EXPIRED";
  }
  if (code === "ADMIN_INVITATION_REJECTED") {
    return "REJECTED";
  }

  return "INVALID";
}

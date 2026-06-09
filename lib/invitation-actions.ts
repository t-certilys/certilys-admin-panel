"use server";

import { adminGet, adminMutation } from "@/lib/admin-api";

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
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Action impossible : invitation non valide.",
    };
  }
}

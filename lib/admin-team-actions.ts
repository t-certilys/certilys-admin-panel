"use server";

import { adminGet, adminMutation } from "@/lib/admin-api";
import type { TeamKpis, TeamMember, TeamRole } from "@/lib/mock/admin-team-data";

type TeamResponse = {
  members: TeamMember[];
  kpis: TeamKpis;
};

type InvitationResponse = {
  invitation: {
    id: string;
    email: string;
    displayName: string | null;
    role: TeamRole;
    status: string;
    expiresAt: string;
  };
};

type MemberResponse = {
  member: TeamMember;
};

export async function getAdminTeamAction(): Promise<TeamResponse> {
  return adminGet<TeamResponse>("/admin/team");
}

export async function inviteAdminTeamMemberAction(input: {
  displayName: string;
  email: string;
  role: TeamRole;
}): Promise<TeamMember> {
  const response = await adminMutation<InvitationResponse>(
    "/admin/team/invitations",
    {
      displayName: input.displayName.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
    },
  );

  return {
    id: response.invitation.id,
    name:
      response.invitation.displayName ??
      response.invitation.email.split("@")[0] ??
      "Administrateur invité",
    email: response.invitation.email,
    role: response.invitation.role,
    status: "INVITED",
    twoFactorEnabled: false,
    lastLoginAt: null,
    avatarUrl: undefined,
    invitedAt: new Date().toISOString(),
    expiresAt: response.invitation.expiresAt,
  };
}

export async function suspendAdminTeamMemberAction(
  memberId: string,
): Promise<TeamMember> {
  const response = await adminMutation<MemberResponse>(
    `/admin/team/${encodeURIComponent(memberId)}/suspend`,
  );
  return response.member;
}

export async function reactivateAdminTeamMemberAction(
  memberId: string,
): Promise<TeamMember> {
  const response = await adminMutation<MemberResponse>(
    `/admin/team/${encodeURIComponent(memberId)}/reactivate`,
  );
  return response.member;
}

export async function resendAdminInvitationAction(
  invitationId: string,
): Promise<TeamMember> {
  const response = await adminMutation<InvitationResponse>(
    `/admin/team/invitations/${encodeURIComponent(invitationId)}/resend`,
  );
  return {
    id: response.invitation.id,
    name:
      response.invitation.displayName ??
      response.invitation.email.split("@")[0] ??
      "Administrateur invité",
    email: response.invitation.email,
    role: response.invitation.role,
    status: "INVITED",
    twoFactorEnabled: false,
    lastLoginAt: null,
    avatarUrl: undefined,
    invitedAt: new Date().toISOString(),
    expiresAt: response.invitation.expiresAt,
  };
}

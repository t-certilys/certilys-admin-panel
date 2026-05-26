"use server";

export type InvitationActionResponse = {
  success: boolean;
  message: string;
};

export type InvitationDetails = {
  teamName: string;
  teamDescription?: string;
  inviterName?: string;
};

/**
 * Récupère les détails d'une invitation via son token ou ID
 */
export async function getInvitationDetails(
  tokenOrId: string
): Promise<InvitationActionResponse & { data?: InvitationDetails }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: Implémenter l'appel API réel
  // Exemple:
  // const response = await fetch(`${process.env.API_URL}/invitations/${tokenOrId}`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // const data = await response.json();

  // Données mockées pour le développement
  return {
    success: true,
    message: "Invitation trouvée",
    data: {
      teamName: "Équipe Alpha",
      teamDescription: "Équipe de développement principale",
      inviterName: "Jean Dupont",
    },
  };
}

/**
 * Accepte une invitation via son token ou ID
 */
export async function acceptInvitation(
  tokenOrId: string
): Promise<InvitationActionResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // TODO: Implémenter l'appel API réel
  // Exemple:
  // const response = await fetch(`${process.env.API_URL}/invitations/${tokenOrId}/accept`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // const data = await response.json();

  return {
    success: true,
    message: "Invitation acceptée avec succès",
  };
}

/**
 * Rejette une invitation via son token ou ID
 */
export async function rejectInvitation(
  tokenOrId: string
): Promise<InvitationActionResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: Implémenter l'appel API réel
  // Exemple:
  // const response = await fetch(`${process.env.API_URL}/invitations/${tokenOrId}/reject`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // const data = await response.json();

  return {
    success: true,
    message: "Invitation rejetée",
  };
}

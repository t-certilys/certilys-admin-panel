"use server";

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

// Mock de base de données d'invitations pour les tests UI
const MOCK_INVITATIONS: Record<string, { details: InvitationDetails; status: "VALID" | "EXPIRED" | "ALREADY_ACCEPTED" | "REJECTED" }> = {
  "token_valid": {
    status: "VALID",
    details: {
      id: "inv-1",
      email: "active@certilys.fr",
      teamName: "Certilys Administration",
      inviterName: "Émilie Leclerc (Directrice RH)",
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    }
  },
  "token_expired": {
    status: "EXPIRED",
    details: {
      id: "inv-2",
      email: "expired@certilys.fr",
      teamName: "Certilys Administration",
      inviterName: "Damien Villette (Admin)",
      expiresAt: new Date(Date.now() - 86400000).toISOString()
    }
  },
  "token_already_accepted": {
    status: "ALREADY_ACCEPTED",
    details: {
      id: "inv-3",
      email: "already@certilys.fr",
      teamName: "Certilys Administration",
      inviterName: "Damien Villette (Admin)",
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    }
  },
  "token_rejected": {
    status: "REJECTED",
    details: {
      id: "inv-4",
      email: "rejected@certilys.fr",
      teamName: "Certilys Administration",
      inviterName: "Damien Villette (Admin)",
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    }
  }
};

/**
 * GET /admin/invitations/resolve?token=...
 * Résout et valide une invitation
 */
export async function getInvitationDetails(
  tokenOrId: string
): Promise<InvitationActionResponse & { data?: InvitationDetails }> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!tokenOrId) {
    return {
      success: false,
      status: "INVALID",
      message: "Jeton d'invitation manquant ou invalide."
    };
  }

  const mock = MOCK_INVITATIONS[tokenOrId];
  if (!mock) {
    return {
      success: false,
      status: "INVALID",
      message: "Cette invitation n'existe pas ou a été supprimée."
    };
  }

  if (mock.status === "EXPIRED") {
    return {
      success: false,
      status: "EXPIRED",
      message: "Cette invitation a expiré. Veuillez contacter un administrateur."
    };
  }

  if (mock.status === "ALREADY_ACCEPTED") {
    return {
      success: false,
      status: "ALREADY_ACCEPTED",
      message: "Cette invitation a déjà été acceptée. Veuillez vous connecter."
    };
  }

  if (mock.status === "REJECTED") {
    return {
      success: false,
      status: "REJECTED",
      message: "Cette invitation a été rejetée."
    };
  }

  return {
    success: true,
    status: "VALID",
    message: "Invitation valide trouvée.",
    data: mock.details
  };
}

/**
 * POST /admin/invitations/accept
 * Accepte une invitation
 */
export async function acceptInvitation(
  tokenOrId: string
): Promise<InvitationActionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const mock = MOCK_INVITATIONS[tokenOrId];
  if (!mock || mock.status !== "VALID") {
    return {
      success: false,
      message: "Action impossible : invitation non valide."
    };
  }

  // On passe le statut à accepté dans notre mock en mémoire pour les tests suivants
  mock.status = "ALREADY_ACCEPTED";

  return {
    success: true,
    message: "Invitation acceptée avec succès ! Vous pouvez maintenant vous connecter à votre compte administrateur."
  };
}

/**
 * POST /admin/invitations/reject
 * Rejette une invitation
 */
export async function rejectInvitation(
  tokenOrId: string
): Promise<InvitationActionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const mock = MOCK_INVITATIONS[tokenOrId];
  if (!mock || mock.status !== "VALID") {
    return {
      success: false,
      message: "Action impossible : invitation non valide."
    };
  }

  mock.status = "REJECTED";

  return {
    success: true,
    message: "L'invitation a été déclinée et rejetée."
  };
}

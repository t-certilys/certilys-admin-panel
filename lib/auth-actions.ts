"use server";

import { cookies } from "next/headers";

export type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN" | "MODERATOR" | "USER";
  accountStatus: "ACTIVE" | "SUSPENDED" | "PENDING";
  requiresTwoFactorSetup: boolean;
  requiresTwoFactorVerification: boolean;
  twoFactorVerified: boolean;
  invitationAccepted: boolean;
};

export type AuthStartResponse = {
  success: boolean;
  message: string;
  challengeId?: string;
  nextStep?: "EMAIL_OTP" | "SUCCESS";
  emailMasked?: string;
  expiresInSeconds?: number;
};

export type AuthVerifyResponse = {
  success: boolean;
  message: string;
  status?: "SUCCESS" | "REQUIRES_2FA" | "REQUIRES_2FA_SETUP" | "SUSPENDED" | "ROLE_FORBIDDEN" | "NOT_INVITED" | "INVITATION_NOT_ACCEPTED";
  challengeId?: string;
  method?: "TOTP" | "BACKUP_CODE";
  setupToken?: string;
  redirectTo?: string;
};

// Liste des emails autorisés et leurs états de simulation pour les tests UI
const MOCK_ACCOUNTS: Record<string, Partial<AdminUser>> = {
  "active@certilys.fr": {
    id: "admin-1",
    role: "ADMIN",
    accountStatus: "ACTIVE",
    requiresTwoFactorSetup: false,
    requiresTwoFactorVerification: false,
    invitationAccepted: true,
  },
  "2fa-required@certilys.fr": {
    id: "admin-2",
    role: "ADMIN",
    accountStatus: "ACTIVE",
    requiresTwoFactorSetup: false,
    requiresTwoFactorVerification: true,
    invitationAccepted: true,
  },
  "2fa-setup-required@certilys.fr": {
    id: "admin-3",
    role: "ADMIN",
    accountStatus: "ACTIVE",
    requiresTwoFactorSetup: true,
    requiresTwoFactorVerification: false,
    invitationAccepted: true,
  },
  "suspended@certilys.fr": {
    id: "admin-4",
    role: "ADMIN",
    accountStatus: "SUSPENDED",
    requiresTwoFactorSetup: false,
    requiresTwoFactorVerification: false,
    invitationAccepted: true,
  },
  "moderator@certilys.fr": {
    id: "admin-5",
    role: "MODERATOR",
    accountStatus: "ACTIVE",
    requiresTwoFactorSetup: false,
    requiresTwoFactorVerification: false,
    invitationAccepted: true,
  },
  "user@certilys.fr": {
    id: "admin-6",
    role: "USER", // Rôle interdit
    accountStatus: "ACTIVE",
    requiresTwoFactorSetup: false,
    requiresTwoFactorVerification: false,
    invitationAccepted: true,
  },
  "pending-invitation@certilys.fr": {
    id: "admin-7",
    role: "ADMIN",
    accountStatus: "ACTIVE",
    requiresTwoFactorSetup: false,
    requiresTwoFactorVerification: false,
    invitationAccepted: false, // Invitation non acceptée
  }
};

/**
 * POST /admin/auth/start
 * Démarre le flux passwordless.
 */
export async function startAuthAction(email: string): Promise<AuthStartResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Vérification basique du format email
  if (!email || !email.includes("@")) {
    return { success: false, message: "Adresse e-mail invalide." };
  }

  const lowercaseEmail = email.toLowerCase();
  const mockAccount = MOCK_ACCOUNTS[lowercaseEmail];

  // Règle absolue : aucun email inconnu ne doit pouvoir s'inscrire librement
  if (!mockAccount) {
    return {
      success: false,
      message: "Cet email n'est associé à aucune invitation ou compte administrateur autorisé."
    };
  }

  // Masquer l'email
  const [localPart, domain] = lowercaseEmail.split("@");
  const maskedLocal = localPart.length > 2 
    ? localPart.substring(0, 2) + "*".repeat(localPart.length - 2)
    : localPart + "**";
  const emailMasked = `${maskedLocal}@${domain}`;

  // On stocke temporairement l'email ciblé dans les cookies pour la phase de vérification OTP
  const cookieStore = await cookies();
  cookieStore.set("pending_auth_email", lowercaseEmail, { maxAge: 600 });

  return {
    success: true,
    message: "Code OTP envoyé avec succès.",
    challengeId: "challenge_" + Math.random().toString(36).substring(2, 9),
    nextStep: "EMAIL_OTP",
    emailMasked,
    expiresInSeconds: 120
  };
}

/**
 * POST /admin/auth/verify
 * Vérifie le code OTP envoyé par email.
 */
export async function verifyOtpAction(challengeId: string, otp: string): Promise<AuthVerifyResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const cookieStore = await cookies();
  const email = cookieStore.get("pending_auth_email")?.value;

  if (!email) {
    return { success: false, message: "Session de connexion expirée ou invalide. Veuillez recommencer." };
  }

  if (otp !== "123456") {
    // Si c'est "000000" on simule trop de tentatives
    if (otp === "000000") {
      return { success: false, message: "Trop de tentatives de validation. Votre code a été expiré." };
    }
    return { success: false, message: "Code OTP incorrect ou expiré." };
  }

  const account = MOCK_ACCOUNTS[email];
  if (!account) {
    return { success: false, message: "Compte introuvable." };
  }

  // Vérification du rôle
  if (account.role === "USER") {
    return { success: false, status: "ROLE_FORBIDDEN", message: "Accès interdit : Rôle insuffisant." };
  }

  // Vérification de l'état du compte
  if (account.accountStatus === "SUSPENDED") {
    return { success: false, status: "SUSPENDED", message: "Ce compte administrateur a été suspendu." };
  }

  // Vérification de l'invitation acceptée
  if (account.invitationAccepted === false) {
    return { success: false, status: "INVITATION_NOT_ACCEPTED", message: "Vous devez accepter l'invitation avant de vous connecter." };
  }

  // Création de la session
  const userSession: AdminUser = {
    id: account.id || "admin-default",
    email: email,
    role: account.role || "ADMIN",
    accountStatus: account.accountStatus || "ACTIVE",
    requiresTwoFactorSetup: account.requiresTwoFactorSetup || false,
    requiresTwoFactorVerification: account.requiresTwoFactorVerification || false,
    twoFactorVerified: false,
    invitationAccepted: true
  };

  cookieStore.set("admin_session", JSON.stringify(userSession), { maxAge: 86400 });
  cookieStore.delete("pending_auth_email");

  if (userSession.requiresTwoFactorSetup) {
    return {
      success: true,
      status: "REQUIRES_2FA_SETUP",
      setupToken: "setup_token_" + Math.random().toString(36).substring(2, 9),
      message: "Configuration de la 2FA requise."
    };
  }

  if (userSession.requiresTwoFactorVerification) {
    return {
      success: true,
      status: "REQUIRES_2FA",
      challengeId: "challenge_2fa_" + Math.random().toString(36).substring(2, 9),
      method: "TOTP",
      message: "Validation de la 2FA requise."
    };
  }

  // Succès direct
  return {
    success: true,
    status: "SUCCESS",
    redirectTo: "/dashboard",
    message: "Connexion réussie."
  };
}

/**
 * POST /admin/auth/oauth/google/callback
 * Simule le callback OAuth de Google
 */
export async function googleCallbackAction(idToken: string): Promise<AuthVerifyResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simuler le décodage d'un email depuis le token Google
  let email = "active@certilys.fr"; // Valeur par défaut pour le mock
  
  if (idToken === "google_suspended") {
    email = "suspended@certilys.fr";
  } else if (idToken === "google_2fa") {
    email = "2fa-required@certilys.fr";
  } else if (idToken === "google_2fa_setup") {
    email = "2fa-setup-required@certilys.fr";
  } else if (idToken === "google_user") {
    email = "user@certilys.fr";
  } else if (idToken === "google_pending") {
    email = "pending-invitation@certilys.fr";
  } else if (idToken === "google_unknown") {
    return {
      success: false,
      status: "NOT_INVITED",
      message: "Votre compte Google n'est pas autorisé. L'accès nécessite une invitation administrative préalable."
    };
  }

  const account = MOCK_ACCOUNTS[email];
  if (!account) {
    return { success: false, message: "Votre compte Google n'est lié à aucune invitation active." };
  }

  // Google ne bypass pas les contrôles : rôle, suspendu, invitation acceptée
  if (account.role === "USER") {
    return { success: false, status: "ROLE_FORBIDDEN", message: "Accès interdit : Rôle insuffisant." };
  }

  if (account.accountStatus === "SUSPENDED") {
    return { success: false, status: "SUSPENDED", message: "Ce compte administrateur a été suspendu." };
  }

  if (account.invitationAccepted === false) {
    return { success: false, status: "INVITATION_NOT_ACCEPTED", message: "L'invitation liée à cet email n'a pas encore été acceptée." };
  }

  const userSession: AdminUser = {
    id: account.id || "admin-google",
    email: email,
    role: account.role || "ADMIN",
    accountStatus: account.accountStatus || "ACTIVE",
    requiresTwoFactorSetup: account.requiresTwoFactorSetup || false,
    requiresTwoFactorVerification: account.requiresTwoFactorVerification || false,
    twoFactorVerified: false,
    invitationAccepted: true
  };

  const cookieStore = await cookies();
  cookieStore.set("admin_session", JSON.stringify(userSession), { maxAge: 86400 });

  if (userSession.requiresTwoFactorSetup) {
    return {
      success: true,
      status: "REQUIRES_2FA_SETUP",
      setupToken: "setup_token_" + Math.random().toString(36).substring(2, 9),
      message: "Configuration de la 2FA requise."
    };
  }

  if (userSession.requiresTwoFactorVerification) {
    return {
      success: true,
      status: "REQUIRES_2FA",
      challengeId: "challenge_2fa_" + Math.random().toString(36).substring(2, 9),
      method: "TOTP",
      message: "Validation 2FA requise."
    };
  }

  return {
    success: true,
    status: "SUCCESS",
    redirectTo: "/dashboard",
    message: "Connexion Google réussie."
  };
}

/**
 * POST /admin/auth/2fa/verify
 * Vérifie le code 2FA (TOTP ou backup code)
 */
export async function verify2FaAction(challengeId: string, code: string, type: "TOTP" | "BACKUP_CODE"): Promise<AuthVerifyResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const cookieStore = await cookies();
  const sessionStr = cookieStore.get("admin_session")?.value;

  if (!sessionStr) {
    return { success: false, message: "Session absente. Veuillez vous reconnecter." };
  }

  const session = JSON.parse(sessionStr) as AdminUser;

  if (type === "TOTP") {
    if (code !== "123456") {
      return { success: false, message: "Code TOTP incorrect." };
    }
  } else {
    // Simulation de code de secours
    if (code !== "9999-9999") {
      return { success: false, message: "Code de secours incorrect ou déjà utilisé." };
    }
  }

  // 2FA validée !
  session.requiresTwoFactorVerification = false;
  session.twoFactorVerified = true;

  cookieStore.set("admin_session", JSON.stringify(session), { maxAge: 86400 });

  return {
    success: true,
    status: "SUCCESS",
    redirectTo: "/dashboard",
    message: "Double facteur validé."
  };
}

/**
 * POST /admin/auth/2fa/setup (Obtention QR Code et clé secrète)
 */
export async function get2FASetupDetailsAction() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    success: true,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Certilys:admin@certilys.fr?secret=JBSWY3DPEHPK3PXP&issuer=Certilys",
    secretKey: "JBSW Y3DP EHPK 3PXP",
    backupCodes: ["1111-1111", "2222-2222", "3333-3333", "4444-4444", "5555-5555"]
  };
}

/**
 * POST /admin/auth/2fa/confirm (Confirmation de la configuration 2FA)
 */
export async function confirm2FASetupAction(code: string): Promise<AuthVerifyResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (code !== "123456") {
    return { success: false, message: "Code d'activation incorrect. La configuration a échoué." };
  }

  const cookieStore = await cookies();
  const sessionStr = cookieStore.get("admin_session")?.value;

  if (!sessionStr) {
    return { success: false, message: "Session introuvable." };
  }

  const session = JSON.parse(sessionStr) as AdminUser;
  session.requiresTwoFactorSetup = false;
  session.requiresTwoFactorVerification = false;
  session.twoFactorVerified = true;

  cookieStore.set("admin_session", JSON.stringify(session), { maxAge: 86400 });

  return {
    success: true,
    status: "SUCCESS",
    redirectTo: "/dashboard",
    message: "Configuration de la 2FA réussie."
  };
}

/**
 * GET /admin/auth/me
 * Récupère la session active
 */
export async function getAdminSessionAction(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get("admin_session")?.value;
  if (!sessionStr) return null;
  return JSON.parse(sessionStr) as AdminUser;
}

/**
 * POST /admin/auth/logout
 */
export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

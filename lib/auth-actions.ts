"use server";

import { adminGet, adminMutation, AdminApiError } from "@/lib/admin-api";

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
  status?:
    | "SUCCESS"
    | "REQUIRES_2FA"
    | "REQUIRES_2FA_SETUP"
    | "SUSPENDED"
    | "ROLE_FORBIDDEN"
    | "NOT_INVITED"
    | "INVITATION_NOT_ACCEPTED";
  challengeId?: string;
  method?: "TOTP" | "BACKUP_CODE";
  setupToken?: string;
  redirectTo?: string;
};

export type TwoFactorSetupResponse = {
  success: boolean;
  message?: string;
  qrCodeUrl: string;
  secretKey: string;
  backupCodes: string[];
};

export async function startAuthAction(
  email: string,
): Promise<AuthStartResponse> {
  return withAdminError(() =>
    adminMutation<AuthStartResponse>("/admin/auth/start", { email }),
  );
}

export async function verifyOtpAction(
  challengeId: string,
  code: string,
): Promise<AuthVerifyResponse> {
  return withAdminError(() =>
    adminMutation<AuthVerifyResponse>("/admin/auth/verify", {
      challengeId,
      code,
    }),
  );
}

export async function googleCallbackAction(
  _simulationToken?: string,
): Promise<AuthVerifyResponse> {
  void _simulationToken;
  try {
    const response = await adminMutation<{ url?: string }>(
      "/admin/auth/google/start",
    );
    return {
      success: true,
      status: "SUCCESS",
      redirectTo: response.url,
      message: "Redirection vers Google.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de démarrer la connexion Google.";
    return { success: false, message };
  }
}

export async function completeGoogleCallbackAction(
  code: string,
  state: string,
): Promise<AuthVerifyResponse> {
  return withAdminError(() =>
    adminMutation<AuthVerifyResponse>("/admin/auth/google/complete", {
      code,
      state,
    }),
  );
}

export async function verify2FaAction(
  _challengeId: string,
  code: string,
  type: "TOTP" | "BACKUP_CODE",
): Promise<AuthVerifyResponse> {
  return withAdminError(() =>
    adminMutation<AuthVerifyResponse>("/admin/auth/2fa/verify", {
      code,
      type,
    }),
  );
}

export async function get2FASetupDetailsAction(): Promise<TwoFactorSetupResponse> {
  try {
    return await adminMutation<TwoFactorSetupResponse>("/admin/auth/2fa/setup");
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de démarrer la configuration 2FA.",
      qrCodeUrl: "",
      secretKey: "",
      backupCodes: [],
    };
  }
}

export async function confirm2FASetupAction(
  code: string,
): Promise<AuthVerifyResponse> {
  return withAdminError(() =>
    adminMutation<AuthVerifyResponse>("/admin/auth/2fa/confirm", {
      code,
      type: "TOTP",
    }),
  );
}

export async function getAdminSessionAction(): Promise<AdminUser | null> {
  try {
    return await adminGet<AdminUser>("/admin/auth/me");
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      return null;
    }
    return null;
  }
}

export async function logoutAdminAction() {
  try {
    return await adminMutation<{ success: boolean }>("/admin/auth/logout");
  } catch {
    return { success: true };
  }
}

async function withAdminError<T extends { success: boolean; message?: string }>(
  callback: () => Promise<T>,
): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Une erreur est survenue. Veuillez réessayer.";
    return { success: false, message } as T;
  }
}

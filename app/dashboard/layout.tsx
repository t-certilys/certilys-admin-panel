import { redirect } from "next/navigation";
import { getAdminSessionAction } from "@/lib/auth-actions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSessionAction();

  // 1. Session absente
  if (!session) {
    redirect("/auth/login");
  }

  // 2. Rôle interdit (différent de ADMIN et MODERATOR) ou compte non actif
  if (
    (session.role !== "ADMIN" && session.role !== "MODERATOR") ||
    session.accountStatus !== "ACTIVE" ||
    !session.invitationAccepted
  ) {
    // Session invalide, on nettoie et redirige
    redirect("/auth/login");
  }

  // 3. Configuration Double Facteur (2FA) obligatoire manquante
  if (session.requiresTwoFactorSetup) {
    redirect("/auth/2fa/setup");
  }

  // 4. Double Facteur requis non validé
  if (session.requiresTwoFactorVerification && !session.twoFactorVerified) {
    redirect("/auth/2fa");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getAdminSessionAction } from "@/lib/auth-actions";
import { settingsNavConfig } from "@/lib/settings-nav-config";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSessionAction();

  if (!session) {
    redirect("/auth/login");
  }

  if (
    (session.role !== "ADMIN" && session.role !== "MODERATOR") ||
    session.accountStatus !== "ACTIVE" ||
    !session.invitationAccepted
  ) {
    redirect("/auth/login");
  }

  if (session.requiresTwoFactorSetup) {
    redirect("/auth/2fa/setup");
  }

  if (session.requiresTwoFactorVerification && !session.twoFactorVerified) {
    redirect("/auth/2fa");
  }

  return (
    <DashboardLayout navConfig={settingsNavConfig} user={session}>
      {children}
    </DashboardLayout>
  );
}

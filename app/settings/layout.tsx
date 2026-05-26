import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { settingsNavConfig } from "@/lib/settings-nav-config";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout navConfig={settingsNavConfig}>{children}</DashboardLayout>;
}

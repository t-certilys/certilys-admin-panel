import { NotificationsPage } from "@/components/certilys-ui/notifications";
import { getAdminNotificationsAction } from "@/lib/admin-notifications-actions";

export default async function Page() {
  const { notifications } = await getAdminNotificationsAction();
  return <NotificationsPage initialNotifications={notifications} />;
}

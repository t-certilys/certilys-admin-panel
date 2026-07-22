import { OrderDetailPage } from "@/components/certilys-ui/orders";
import { getAdminOrderAction } from "@/lib/admin-orders-actions";

type OrderDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: OrderDetailRouteProps) {
  const { id } = await params;
  const order = await getAdminOrderAction(id);

  return <OrderDetailPage key={id} initialOrder={order} />;
}

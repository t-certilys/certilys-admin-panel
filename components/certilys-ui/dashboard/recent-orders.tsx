import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  recentOrders,
  orderStatusConfig,
  formatXOF,
  formatDate,
  type RecentOrder,
} from "@/lib/mock/admin-dashboard-data";

// ─── Order Row ───────────────────────────────────────────────────────────────

function OrderRow({ order }: { order: RecentOrder }) {
  const statusCfg = orderStatusConfig[order.statut];

  return (
    <TableRow className="border-border/50 hover:bg-muted/40 transition-colors">
      {/* Commande ID */}
      <TableCell className="py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="hover:text-foreground hover:underline underline-offset-2 transition-colors"
          aria-label={`Voir la commande ${order.id}`}
        >
          {order.id}
        </Link>
      </TableCell>

      {/* Client */}
      <TableCell className="py-3 text-sm text-foreground whitespace-nowrap">
        {order.client}
      </TableCell>

      {/* Formation */}
      <TableCell className="py-3 text-sm text-muted-foreground max-w-[160px] lg:max-w-[220px] truncate">
        <span title={order.formation}>{order.formation}</span>
      </TableCell>

      {/* Montant */}
      <TableCell className="py-3 text-sm font-medium text-foreground whitespace-nowrap text-right tabular-nums">
        {formatXOF(order.montant)}
      </TableCell>

      {/* Statut */}
      <TableCell className="py-3 whitespace-nowrap">
        <Badge
          variant="outline"
          className={`text-xs font-medium px-2 py-0.5 ${statusCfg.colorClass}`}
          aria-label={`Statut : ${statusCfg.label}`}
        >
          {statusCfg.label}
        </Badge>
      </TableCell>

      {/* Date */}
      <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
        <time dateTime={order.date}>{formatDate(order.date)}</time>
      </TableCell>
    </TableRow>
  );
}

// ─── Recent Orders Table ─────────────────────────────────────────────────────

export function RecentOrders() {
  return (
    <Card className="border-border/60 shadow-none bg-card">
      <CardHeader className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Dernières commandes
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              Les 5 commandes les plus récentes
            </CardDescription>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs text-primary hover:underline underline-offset-2 shrink-0"
            aria-label="Voir toutes les commandes"
          >
            Voir tout
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-4 pt-0">
        {/* Scroll horizontal sur mobile */}
        <div className="overflow-x-auto">
          <Table aria-label="Tableau des dernières commandes Certilys">
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Commande
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Client
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Formation
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                  Montant
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Statut
                </TableHead>
                <TableHead className="px-4 py-3 pr-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

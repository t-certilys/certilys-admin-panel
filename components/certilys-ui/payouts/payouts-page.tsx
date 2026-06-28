"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import {
  Wallet01Icon,
  Coins01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Clock01Icon,
  InboxIcon,
  SearchRemoveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  type AdminPayout,
  type PayoutStatus,
  mockAdminPayouts,
  PAYOUT_STATUS_CONFIG,
  methodLabel,
  destinationSummary,
  formatXOF,
  formatDateTime,
} from "@/lib/mock/admin-payouts-data";

function StatusBadge({ status }: { status: PayoutStatus }) {
  const cfg = PAYOUT_STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2 py-0.5 text-xs font-medium ${cfg.colorClass}`}
    >
      <span className={`size-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </Badge>
  );
}

const KPI_ICONS: Record<string, IconSvgElement> = {
  pendingCount: Clock01Icon,
  pendingAmount: Wallet01Icon,
  paidAmount: Coins01Icon,
};

function KpiCards({
  pendingCount,
  pendingAmount,
  paidAmount,
}: {
  pendingCount: number;
  pendingAmount: number;
  paidAmount: number;
}) {
  const items = [
    {
      id: "pendingCount",
      label: "Demandes en attente",
      value: String(pendingCount),
      colorClass: "text-chart-4",
      iconBg: "bg-chart-4/15",
    },
    {
      id: "pendingAmount",
      label: "Montant à reverser",
      value: formatXOF(pendingAmount),
      colorClass: "text-primary",
      iconBg: "bg-primary/15",
    },
    {
      id: "paidAmount",
      label: "Déjà reversé",
      value: formatXOF(paidAmount),
      colorClass: "text-emerald-600",
      iconBg: "bg-emerald-500/15",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((kpi) => (
        <Card
          key={kpi.id}
          className="border-border/60 shadow-none transition-colors hover:bg-muted/20 hover:border-border"
        >
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${kpi.iconBg}`}
            >
              <HugeiconsIcon
                icon={KPI_ICONS[kpi.id]}
                className={`size-4 ${kpi.colorClass}`}
                size={16}
                strokeWidth={1.5}
              />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold tabular-nums text-foreground leading-tight">
                {kpi.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {kpi.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyRow({ type }: { type: "empty" | "no-results" }) {
  const isEmpty = type === "empty";
  return (
    <TableRow>
      <TableCell colSpan={6}>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon
              icon={isEmpty ? InboxIcon : SearchRemoveIcon}
              className="size-6 text-muted-foreground"
              size={24}
              strokeWidth={1.5}
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            {isEmpty ? "Aucune demande de reversement" : "Aucun résultat"}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-3.5 w-36" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-3.5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-28 ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export default function PayoutsPage() {
  const [statusParam, setStatusParam] = useQueryState("status", {
    defaultValue: "",
  });
  const [search, setSearch] = React.useState("");

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const [data, setData] = React.useState<AdminPayout[]>(mockAdminPayouts);
  const [pending, setPending] = React.useState<string | null>(null);

  const pendingCount = data.filter((p) => p.status === "PENDING").length;
  const pendingAmount = data
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = data
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = data.filter((p) => {
    const q = search.toLowerCase().trim();
    if (q && !p.instructorName.toLowerCase().includes(q)) return false;
    if (statusParam && p.status !== statusParam) return false;
    return true;
  });

  async function resolve(
    id: string,
    next: "PAID" | "REJECTED",
    name: string,
    amount: number,
  ) {
    setPending(id);
    // Simulation : la vraie action = POST /admin/payouts/:id/approve|reject (voir PAYOUTS-API-SPEC.md).
    await new Promise((r) => setTimeout(r, 700));
    setData((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: next, processedAt: new Date().toISOString() }
          : p,
      ),
    );
    setPending(null);
    if (next === "PAID") {
      toast.success(`Reversement validé — ${name} · ${formatXOF(amount)}`);
    } else {
      toast.info(`Demande rejetée — ${name}`);
    }
    console.log("[AUDIT] PAYOUT_RESOLVED", {
      id,
      status: next,
      timestamp: new Date().toISOString(),
    });
  }

  const hasData = data.length > 0;
  const hasResults = filtered.length > 0;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-sora">
          Reversements
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Validez les demandes de retrait des formateurs (Mobile Money).
        </p>
      </div>

      <KpiCards
        pendingCount={pendingCount}
        pendingAmount={pendingAmount}
        paidAmount={paidAmount}
      />

      {/* Recherche + filtre */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Rechercher un formateur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Select
          value={statusParam || "all"}
          onValueChange={(v) => setStatusParam(v === "all" ? null : v)}
        >
          <SelectTrigger size="sm" className="w-[170px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="PAID">Payé</SelectItem>
            <SelectItem value="REJECTED">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/60 shadow-none overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Formateur</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Demandé le</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !hasData ? (
                <EmptyRow type="empty" />
              ) : !hasResults ? (
                <EmptyRow type="no-results" />
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {p.instructorName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {destinationSummary(p.destination)}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {methodLabel(p.destination)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(p.requestedAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums text-foreground">
                      {formatXOF(p.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <AlertDialog>
                            <AlertDialogTriggerButton
                              disabled={pending === p.id}
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Valider le reversement ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Confirmez le versement de{" "}
                                  {formatXOF(p.amount)} à {p.instructorName}.
                                  Vérifiez les coordonnées ci-dessous : cette
                                  action déclenche le décaissement.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                                <DetailRow
                                  label="Méthode"
                                  value={methodLabel(p.destination)}
                                />
                                {p.destination.type === "MOBILE_MONEY" ? (
                                  <>
                                    <DetailRow
                                      label="Réseau"
                                      value={p.destination.network}
                                    />
                                    <DetailRow
                                      label="Numéro"
                                      value={p.destination.phone}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <DetailRow
                                      label="Titulaire"
                                      value={p.destination.holder}
                                    />
                                    <DetailRow
                                      label="Banque"
                                      value={p.destination.bankName}
                                    />
                                    <DetailRow
                                      label="IBAN"
                                      value={p.destination.iban}
                                    />
                                    <DetailRow
                                      label="BIC / SWIFT"
                                      value={p.destination.bic}
                                    />
                                  </>
                                )}
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    resolve(
                                      p.id,
                                      "PAID",
                                      p.instructorName,
                                      p.amount,
                                    )
                                  }
                                >
                                  Valider le versement
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending === p.id}
                            onClick={() =>
                              resolve(p.id, "REJECTED", p.instructorName, p.amount)
                            }
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                          >
                            <HugeiconsIcon
                              icon={Cancel01Icon}
                              className="size-3.5"
                              size={14}
                              strokeWidth={1.5}
                            />
                            Rejeter
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {p.processedAt ? formatDateTime(p.processedAt) : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Prototype, actions simulées. Le décaissement réel se fera côté backend
        (voir PAYOUTS-API-SPEC.md).
      </p>
    </div>
  );
}

// Bouton déclencheur "Valider" (séparé pour rester lisible).
function AlertDialogTriggerButton({ disabled }: { disabled: boolean }) {
  return (
    <AlertDialogTrigger asChild>
      <Button size="sm" disabled={disabled} className="h-8 gap-1.5 text-xs">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className="size-3.5"
          size={14}
          strokeWidth={1.5}
        />
        Valider
      </Button>
    </AlertDialogTrigger>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground break-all">
        {value}
      </span>
    </div>
  );
}

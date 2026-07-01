"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import {
  Wallet01Icon,
  Coins01Icon,
  CheckmarkCircle02Icon,
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
  getAdminPayoutsAction,
  retryAdminPayoutAction,
  type AdminPayout,
  type AdminPayoutDestination,
  type AdminPayoutStatus,
} from "@/lib/admin-payouts-actions";

const PAYOUT_STATUS_CONFIG: Record<
  AdminPayoutStatus,
  { label: string; colorClass: string; dotClass: string }
> = {
  PENDING: {
    label: "En attente",
    colorClass: "text-chart-4 border-chart-4/40 bg-chart-4/10",
    dotClass: "bg-chart-4",
  },
  PROCESSING: {
    label: "En traitement",
    colorClass: "text-primary border-primary/40 bg-primary/10",
    dotClass: "bg-primary",
  },
  SUCCEEDED: {
    label: "Réussi",
    colorClass: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    dotClass: "bg-emerald-500",
  },
  FAILED: {
    label: "Échoué",
    colorClass: "text-destructive border-destructive/40 bg-destructive/10",
    dotClass: "bg-destructive",
  },
  CANCELLED: {
    label: "Annulé",
    colorClass: "text-muted-foreground border-border bg-muted/50",
    dotClass: "bg-muted-foreground",
  },
};

const KPI_ICONS: Record<string, IconSvgElement> = {
  pendingCount: Clock01Icon,
  pendingAmount: Wallet01Icon,
  paidAmount: Coins01Icon,
};

function StatusBadge({ status }: { status: AdminPayoutStatus }) {
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
      label: "Reversements à suivre",
      value: String(pendingCount),
      colorClass: "text-chart-4",
      iconBg: "bg-chart-4/15",
    },
    {
      id: "pendingAmount",
      label: "Montant en cours",
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
            {isEmpty ? "Aucun reversement" : "Aucun résultat"}
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
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<AdminPayout[]>([]);
  const [pending, setPending] = React.useState<string | null>(null);

  const refreshPayouts = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await getAdminPayoutsAction());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les reversements.",
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshPayouts();
  }, [refreshPayouts]);

  const pendingStatuses: AdminPayoutStatus[] = ["PENDING", "PROCESSING"];
  const pendingCount = data.filter((p) => pendingStatuses.includes(p.status)).length;
  const pendingAmount = data
    .filter((p) => pendingStatuses.includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = data
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = data.filter((p) => {
    const q = search.toLowerCase().trim();
    if (
      q &&
      !p.instructorName.toLowerCase().includes(q) &&
      !destinationSummary(p.destination).toLowerCase().includes(q)
    ) {
      return false;
    }
    if (statusParam && p.status !== statusParam) return false;
    return true;
  });

  async function retry(id: string, name: string) {
    setPending(id);
    try {
      const updated = await retryAdminPayoutAction(id);
      setData((prev) =>
        prev.map((payout) => (payout.id === id ? updated : payout)),
      );
      toast.success(`Reversement relancé pour ${name}.`);
      await refreshPayouts();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de relancer ce reversement.",
      );
    } finally {
      setPending(null);
    }
  }

  const hasData = data.length > 0;
  const hasResults = filtered.length > 0;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-sora">
          Reversements
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Suivez les reversements formateurs, les traitements Moneroo et les
          relances administratives.
        </p>
      </div>

      <KpiCards
        pendingCount={pendingCount}
        pendingAmount={pendingAmount}
        paidAmount={paidAmount}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Rechercher un formateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Select
          value={statusParam || "all"}
          onValueChange={(v) => setStatusParam(v === "all" ? null : v)}
        >
          <SelectTrigger size="sm" className="w-[190px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="PROCESSING">En traitement</SelectItem>
            <SelectItem value="SUCCEEDED">Réussi</SelectItem>
            <SelectItem value="FAILED">Échoué</SelectItem>
            <SelectItem value="CANCELLED">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {loadError}
        </div>
      ) : null}

      <Card className="border-border/60 shadow-none overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Formateur</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Déclenché le</TableHead>
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
                      {formatXOF(p.amount, p.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                      {p.status === "FAILED" && p.failureReason ? (
                        <p className="mt-1 max-w-[220px] truncate text-xs text-destructive">
                          {p.failureReason}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "FAILED" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              disabled={pending === p.id}
                              className="h-8 gap-1.5 text-xs"
                            >
                              <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                className="size-3.5"
                                size={14}
                                strokeWidth={1.5}
                              />
                              Relancer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Relancer le reversement ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Une nouvelle tentative Moneroo sera lancée pour{" "}
                                {p.instructorName} à hauteur de{" "}
                                {formatXOF(p.amount, p.currency)}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                              <DetailRow
                                label="Méthode"
                                value={methodLabel(p.destination)}
                              />
                              <DetailRow
                                label="Destination"
                                value={destinationSummary(p.destination)}
                              />
                              {p.failureReason ? (
                                <DetailRow
                                  label="Dernière erreur"
                                  value={p.failureReason}
                                />
                              ) : null}
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => retry(p.id, p.instructorName)}
                              >
                                Relancer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {p.processedAt ? formatDateTime(p.processedAt) : "-"}
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
    </div>
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

function methodLabel(destination: AdminPayoutDestination): string {
  if (destination.type === "BANK_TRANSFER") return "Virement bancaire";
  if (destination.type === "MOBILE_MONEY") return "Mobile Money";
  return "Non configuré";
}

function destinationSummary(destination: AdminPayoutDestination): string {
  if (destination.type === "MOBILE_MONEY") {
    return `${destination.network} · ${destination.phone}`;
  }
  if (destination.type === "BANK_TRANSFER") {
    return `${destination.bankName} · ${destination.iban}`;
  }
  return destination.label;
}

function formatXOF(amount: number, currency = "XOF"): string {
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}


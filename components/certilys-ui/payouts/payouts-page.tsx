"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Coins01Icon,
  InboxIcon,
  SearchRemoveIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  attachProviderPayoutIdAction,
  confirmPayoutFailureAction,
  createPayoutFailureChallengeAction,
  getAdminPayoutRunAction,
  getAdminPayoutRunsAction,
  getAdminPayoutsAction,
  retryAdminPayoutAction,
  syncAdminPayoutAction,
  type AdminPayout,
  type AdminPayoutDestination,
  type AdminPayoutRun,
  type AdminPayoutRunItem,
  type AdminPayoutRunStatus,
  type AdminPayoutStatus,
  type PayoutFailureChallenge,
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

const RUN_STATUS_CONFIG: Record<
  AdminPayoutRunStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "En attente", className: "text-chart-4" },
  PROCESSING: { label: "En traitement", className: "text-primary" },
  PARTIAL: { label: "Partiel", className: "text-chart-4" },
  SUCCEEDED: { label: "Réussi", className: "text-emerald-600" },
  FAILED: { label: "Échoué", className: "text-destructive" },
};

const KPI_ICONS: Record<string, IconSvgElement> = {
  pendingCount: Clock01Icon,
  pendingAmount: Wallet01Icon,
  reconciliationCount: AlertCircleIcon,
  paidAmount: Coins01Icon,
};

export default function PayoutsPage() {
  const [statusParam, setStatusParam] = useQueryState("status", {
    defaultValue: "",
  });
  const [tab, setTab] = React.useState<"payouts" | "runs">("payouts");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<AdminPayout[]>([]);
  const [runs, setRuns] = React.useState<AdminPayoutRun[]>([]);
  const [runsLoading, setRunsLoading] = React.useState(false);
  const [pending, setPending] = React.useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] =
    React.useState<AdminPayout | null>(null);
  const [selectedRun, setSelectedRun] = React.useState<
    (AdminPayoutRun & { items: AdminPayoutRunItem[] }) | null
  >(null);

  const refreshPayouts = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await getAdminPayoutsAction());
    } catch (error) {
      setLoadError(errorMessage(error, "Impossible de charger les reversements."));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRuns = React.useCallback(async () => {
    setRunsLoading(true);
    try {
      setRuns(await getAdminPayoutRunsAction());
    } catch (error) {
      toast.error(errorMessage(error, "Impossible de charger les runs."));
    } finally {
      setRunsLoading(false);
    }
  }, []);

  React.useEffect(() => void refreshPayouts(), [refreshPayouts]);
  React.useEffect(() => {
    if (tab === "runs" && runs.length === 0) void refreshRuns();
  }, [refreshRuns, runs.length, tab]);

  const pendingStatuses: AdminPayoutStatus[] = ["PENDING", "PROCESSING"];
  const pendingCount = data.filter((p) => pendingStatuses.includes(p.status)).length;
  const pendingAmount = data
    .filter((p) => pendingStatuses.includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);
  const reconciliationCount = data.filter((p) => p.requiresReconciliation).length;
  const paidAmount = data
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = data.filter((payout) => {
    const query = search.toLowerCase().trim();
    if (
      query &&
      !payout.instructorName.toLowerCase().includes(query) &&
      !destinationSummary(payout.destination).toLowerCase().includes(query)
    ) {
      return false;
    }
    return !statusParam || payout.status === statusParam;
  });

  async function mutate(
    payout: AdminPayout,
    operation: () => Promise<AdminPayout>,
    successMessage: string,
  ) {
    setPending(payout.id);
    try {
      const updated = await operation();
      setData((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelectedPayout((current) => (current?.id === updated.id ? updated : current));
      toast.success(successMessage);
      await Promise.all([refreshPayouts(), refreshRuns()]);
    } catch (error) {
      toast.error(errorMessage(error, "Impossible de traiter ce reversement."));
    } finally {
      setPending(null);
    }
  }

  async function openRun(runId: string) {
    setPending(runId);
    try {
      setSelectedRun(await getAdminPayoutRunAction(runId));
    } catch (error) {
      toast.error(errorMessage(error, "Impossible de charger ce run."));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-sora text-2xl font-semibold tracking-tight text-foreground">
          Reversements
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Suivez les reversements formateurs, les traitements Moneroo et les
          relances administratives.
        </p>
      </div>

      <KpiCards
        pendingCount={pendingCount}
        pendingAmount={pendingAmount}
        reconciliationCount={reconciliationCount}
        paidAmount={paidAmount}
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          <TabsTrigger value="payouts">Reversements</TabsTrigger>
          <TabsTrigger value="runs">Runs mensuels</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "payouts" ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Rechercher un formateur..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full sm:max-w-sm"
            />
            <Select
              value={statusParam || "all"}
              onValueChange={(value) =>
                setStatusParam(value === "all" ? null : value)
              }
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
          {loadError ? <ErrorBanner message={loadError} /> : null}
          <PayoutTable
            payouts={filtered}
            loading={loading}
            hasSourceData={data.length > 0}
            pending={pending}
            onSelect={setSelectedPayout}
            onRetry={(payout) =>
              mutate(
                payout,
                () => retryAdminPayoutAction(payout.id),
                `Reversement relancé pour ${payout.instructorName}.`,
              )
            }
            onSync={(payout) =>
              mutate(
                payout,
                () => syncAdminPayoutAction(payout.id),
                `Reversement synchronisé pour ${payout.instructorName}.`,
              )
            }
          />
        </>
      ) : (
        <RunsTable
          runs={runs}
          loading={runsLoading}
          pending={pending}
          onSelect={(run) => void openRun(run.runId)}
        />
      )}

      <PayoutDetailSheet
        payout={selectedPayout}
        pending={pending}
        onOpenChange={(open) => !open && setSelectedPayout(null)}
        onAttach={(payout, providerPayoutId) =>
          mutate(
            payout,
            () => attachProviderPayoutIdAction(payout.id, providerPayoutId),
            "Identifiant Moneroo enregistré et vérifié.",
          )
        }
        onCreateChallenge={createPayoutFailureChallengeAction}
        onConfirmFailure={(payout, challengeId, phrase) =>
          mutate(
            payout,
            () => confirmPayoutFailureAction(payout.id, challengeId, phrase),
            "Échec définitif confirmé. Les fonds sont de nouveau disponibles.",
          )
        }
      />
      <RunDetailSheet
        run={selectedRun}
        onOpenChange={(open) => !open && setSelectedRun(null)}
      />
    </div>
  );
}

function KpiCards(props: {
  pendingCount: number;
  pendingAmount: number;
  reconciliationCount: number;
  paidAmount: number;
}) {
  const items = [
    {
      id: "pendingCount",
      label: "Reversements à suivre",
      value: String(props.pendingCount),
      colorClass: "text-chart-4",
      iconBg: "bg-chart-4/15",
    },
    {
      id: "pendingAmount",
      label: "Montant en cours",
      value: formatXOF(props.pendingAmount),
      colorClass: "text-primary",
      iconBg: "bg-primary/15",
    },
    {
      id: "reconciliationCount",
      label: "En réconciliation",
      value: String(props.reconciliationCount),
      colorClass: "text-destructive",
      iconBg: "bg-destructive/10",
    },
    {
      id: "paidAmount",
      label: "Déjà reversé",
      value: formatXOF(props.paidAmount),
      colorClass: "text-emerald-600",
      iconBg: "bg-emerald-500/15",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <Card key={kpi.id} className="border-border/60 shadow-none">
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
              <p className="text-lg font-bold leading-tight tabular-nums">
                {kpi.value}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {kpi.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PayoutTable(props: {
  payouts: AdminPayout[];
  loading: boolean;
  hasSourceData: boolean;
  pending: string | null;
  onSelect: (payout: AdminPayout) => void;
  onRetry: (payout: AdminPayout) => void;
  onSync: (payout: AdminPayout) => void;
}) {
  return (
    <Card className="overflow-hidden border-border/60 p-0 shadow-none">
      <div className="overflow-x-auto">
        <Table className="min-w-[820px]">
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
            {props.loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : props.payouts.length === 0 ? (
              <EmptyRow type={props.hasSourceData ? "no-results" : "empty"} />
            ) : (
              props.payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <p className="font-medium">{payout.instructorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {destinationSummary(payout.destination)}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {methodLabel(payout.destination)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(payout.requestedAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums">
                    {formatXOF(payout.amount, payout.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payout.status} />
                    {payout.requiresReconciliation ? (
                      <p className="mt-1 text-xs font-medium text-destructive">
                        Vérification manuelle
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {payout.status === "FAILED" && payout.retryable ? (
                        <Button
                          size="sm"
                          disabled={props.pending === payout.id}
                          onClick={() => props.onRetry(payout)}
                        >
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            className="size-3.5"
                            size={14}
                            strokeWidth={1.5}
                          />
                          Relancer
                        </Button>
                      ) : null}
                      {payout.status === "PROCESSING" &&
                      payout.providerPayoutId ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={props.pending === payout.id}
                          onClick={() => props.onSync(payout)}
                        >
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            className="size-3.5"
                            size={14}
                            strokeWidth={1.5}
                          />
                          Synchroniser
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => props.onSelect(payout)}
                      >
                        Détails
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function RunsTable(props: {
  runs: AdminPayoutRun[];
  loading: boolean;
  pending: string | null;
  onSelect: (run: AdminPayoutRun) => void;
}) {
  return (
    <Card className="overflow-hidden border-border/60 p-0 shadow-none">
      <div className="overflow-x-auto">
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Période</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Scannés</TableHead>
              <TableHead className="text-right">Réussis</TableHead>
              <TableHead className="text-right">En cours</TableHead>
              <TableHead className="text-right">Montant confirmé</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : props.runs.length === 0 ? (
              <EmptyRow type="empty" />
            ) : (
              props.runs.map((run) => (
                <TableRow key={run.runId}>
                  <TableCell className="font-medium">{run.period}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={RUN_STATUS_CONFIG[run.status].className}>
                      {RUN_STATUS_CONFIG[run.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {run.scanned}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {run.succeeded}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {run.processing}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatXOF(run.totalSucceededAmount, run.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={props.pending === run.runId}
                      onClick={() => props.onSelect(run)}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function PayoutDetailSheet(props: {
  payout: AdminPayout | null;
  pending: string | null;
  onOpenChange: (open: boolean) => void;
  onAttach: (payout: AdminPayout, providerPayoutId: string) => Promise<void>;
  onCreateChallenge: (
    payoutId: string,
    reason: string,
  ) => Promise<PayoutFailureChallenge>;
  onConfirmFailure: (
    payout: AdminPayout,
    challengeId: string,
    phrase: string,
  ) => Promise<void>;
}) {
  const [providerId, setProviderId] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [challenge, setChallenge] =
    React.useState<PayoutFailureChallenge | null>(null);
  const [phrase, setPhrase] = React.useState("");
  const [challengePending, setChallengePending] = React.useState(false);

  React.useEffect(() => {
    setProviderId("");
    setReason("");
    setChallenge(null);
    setPhrase("");
  }, [props.payout?.id]);

  if (!props.payout) return null;
  const payout = props.payout;

  async function createChallenge() {
    if (reason.trim().length < 20) {
      toast.error("Le motif doit contenir au moins 20 caractères.");
      return;
    }
    setChallengePending(true);
    try {
      setChallenge(await props.onCreateChallenge(payout.id, reason.trim()));
    } catch (error) {
      toast.error(errorMessage(error, "Impossible de créer la confirmation."));
    } finally {
      setChallengePending(false);
    }
  }

  return (
    <Sheet open onOpenChange={props.onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{payout.instructorName}</SheetTitle>
          <SheetDescription>
            Reversement {formatXOF(payout.amount, payout.currency)}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4 pb-4">
          <div className="divide-y rounded-lg border">
            <DetailRow label="Statut" value={PAYOUT_STATUS_CONFIG[payout.status].label} />
            <DetailRow label="Provider" value={payout.provider} />
            <DetailRow label="ID Moneroo" value={payout.providerPayoutId ?? "Non disponible"} />
            <DetailRow label="Statut provider" value={payout.providerStatus ?? "-"} />
            <DetailRow label="Run" value={payout.runPeriod ?? "-"} />
            <DetailRow
              label="Dernière synchronisation"
              value={formatDateTime(payout.lastSyncedAt)}
            />
            <DetailRow
              label="Tentatives"
              value={String(payout.reconciliationAttempts)}
            />
            <DetailRow
              label="Destination"
              value={destinationSummary(payout.destination)}
            />
          </div>

          {payout.failureReason ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {payout.failureReason}
            </div>
          ) : null}

          {payout.requiresReconciliation && !payout.providerPayoutId ? (
            <section className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold">Identifiant Moneroo</h3>
              <div className="flex gap-2">
                <Input
                  value={providerId}
                  onChange={(event) => setProviderId(event.target.value)}
                  placeholder="pay_..."
                />
                <Button
                  disabled={!providerId.trim() || props.pending === payout.id}
                  onClick={() => void props.onAttach(payout, providerId.trim())}
                >
                  Vérifier
                </Button>
              </div>
            </section>
          ) : null}

          {payout.requiresReconciliation ? (
            <section className="space-y-3 border-t pt-4">
              <div>
                <h3 className="text-sm font-semibold text-destructive">
                  Confirmer un échec définitif
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cette action libère les allocations pour un nouveau transfert.
                </p>
              </div>
              {!challenge ? (
                <>
                  <Textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Motif vérifié auprès de Moneroo..."
                    rows={4}
                  />
                  <Button
                    variant="destructive"
                    disabled={challengePending}
                    onClick={() => void createChallenge()}
                  >
                    Première confirmation
                  </Button>
                </>
              ) : (
                <div className="space-y-3 rounded-lg border border-destructive/20 p-3">
                  <p className="font-mono text-sm font-semibold">
                    {challenge.confirmationPhrase}
                  </p>
                  <Input
                    value={phrase}
                    onChange={(event) => setPhrase(event.target.value)}
                    placeholder="Saisir la phrase exacte"
                  />
                  <Button
                    variant="destructive"
                    disabled={
                      phrase !== challenge.confirmationPhrase ||
                      props.pending === payout.id
                    }
                    onClick={() =>
                      void props.onConfirmFailure(
                        payout,
                        challenge.challengeId,
                        phrase,
                      )
                    }
                  >
                    Confirmer définitivement
                  </Button>
                </div>
              )}
            </section>
          ) : null}
        </div>
        <SheetFooter />
      </SheetContent>
    </Sheet>
  );
}

function RunDetailSheet(props: {
  run: (AdminPayoutRun & { items: AdminPayoutRunItem[] }) | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!props.run) return null;
  return (
    <Sheet open onOpenChange={props.onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Run {props.run.period}</SheetTitle>
          <SheetDescription>
            {RUN_STATUS_CONFIG[props.run.status].label} ·{" "}
            {formatXOF(props.run.totalSucceededAmount, props.run.currency)}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-2 px-4 pb-4">
          {props.run.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 border-b py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{item.instructorName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.reason ?? item.error ?? item.status}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold tabular-nums">
                  {formatXOF(item.amount, item.currency)}
                </p>
                <p className="text-xs text-muted-foreground">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatusBadge({ status }: { status: AdminPayoutStatus }) {
  const config = PAYOUT_STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2 py-0.5 text-xs font-medium ${config.colorClass}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </Badge>
  );
}

function EmptyRow({ type }: { type: "empty" | "no-results" }) {
  return (
    <TableRow>
      <TableCell colSpan={7}>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon
              icon={type === "empty" ? InboxIcon : SearchRemoveIcon}
              className="size-6 text-muted-foreground"
              size={24}
              strokeWidth={1.5}
            />
          </div>
          <p className="text-sm font-medium">
            {type === "empty" ? "Aucun reversement" : "Aucun résultat"}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton className="h-4 w-24" />
        </TableCell>
      ))}
    </TableRow>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
      {message}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="break-all text-right font-medium">{value}</span>
    </div>
  );
}

function methodLabel(destination: AdminPayoutDestination) {
  if (destination.type === "BANK_TRANSFER") return "Virement bancaire";
  if (destination.type === "MOBILE_MONEY") return "Mobile Money";
  return "Non configuré";
}

function destinationSummary(destination: AdminPayoutDestination) {
  if (destination.type === "MOBILE_MONEY") {
    return `${destination.network} · ${destination.phone}`;
  }
  if (destination.type === "BANK_TRANSFER") {
    return `${destination.bankName} · ${destination.iban}`;
  }
  return destination.label;
}

function formatXOF(amount: number, currency = "XOF") {
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

"use client";

import { ArrowUp01Icon, ArrowDown01Icon, MinusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { curveCardinal } from "@visx/curve";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area } from "@/components/charts/area-chart";
import { StatCardChart } from "@/components/stat-card-chart";

import {
  type DashboardKpi,
  type TrendDirection,
} from "@/lib/mock/admin-dashboard-data";

// ─── Helpers ────────────────────────────────────────────────────────────────

function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === "up")
    return <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" size={12} strokeWidth={1.5} aria-hidden={true} />;
  if (direction === "down")
    return <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" size={12} strokeWidth={1.5} aria-hidden={true} />;
  return <HugeiconsIcon icon={MinusSignIcon} className="size-3" size={12} strokeWidth={1.5} aria-hidden={true} />;
}

function trendBadgeClass(direction: TrendDirection): string {
  if (direction === "up")
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-500";
  if (direction === "down")
    return "border-amber-500/25 bg-amber-500/10 text-amber-500";
  return "border-border bg-muted text-muted-foreground";
}

function areaColor(direction: TrendDirection): string {
  if (direction === "up") return "var(--chart-1)";
  if (direction === "down") return "var(--chart-4)";
  return "var(--chart-5)";
}

// ─── Single KPI Card ─────────────────────────────────────────────────────────

function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  // Convertit les sparkline points en format attendu par Bklit (date: Date)
  // Les dates sont stables (pas d'inline object), pas de re-render infini
  const sparkData = kpi.sparkline.map((pt, i) => ({
    date: new Date(2026, 4, i + 1),
    value: pt.value,
  }));

  const color = areaColor(kpi.trendDirection);

  return (
    <Card className="w-full gap-0 py-0 border-border/60 bg-card shadow-none transition-colors hover:bg-muted/20 hover:border-border min-w-0 overflow-hidden">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground leading-none">
          {kpi.label}
        </CardTitle>
        <CardAction>
          <Badge
            variant="outline"
            className={`gap-1 text-xs font-medium px-2 py-0.5 ${trendBadgeClass(kpi.trendDirection)}`}
            aria-label={kpi.trendLabel}
          >
            <TrendIcon direction={kpi.trendDirection} />
            <span>{kpi.trend}</span>
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 px-4 pt-0 pb-3">
        {/* Valeur principale */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-foreground tabular-nums leading-tight">
            {kpi.displayValue}
          </span>
          <span className="text-xs text-muted-foreground">{kpi.context}</span>
        </div>

        {/* Mini sparkline — Bklit Area sans hover bridge (évite boucle infinie) */}
        <StatCardChart size="sm">
          <AreaChart
            aspectRatio="3 / 1"
            className="w-full"
            data={sparkData}
            margin={{ top: 4, right: 0, bottom: 4, left: 0 }}
            animationDuration={800}
          >
            <Area
              curve={curveCardinal.tension(0.65)}
              dataKey="value"
              fill={color}
              fillOpacity={0.3}
              gradientToOpacity={0}
              showHighlight={false}
              stroke={color}
              strokeWidth={1.5}
            />
          </AreaChart>
        </StatCardChart>
      </CardContent>
    </Card>
  );
}

// ─── KPI Cards Grid ──────────────────────────────────────────────────────────

export function KpiCards({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <section
      aria-label="Indicateurs clés de performance Certilys"
      className="grid gap-4 px-4 lg:px-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]"
    >
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </section>
  );
}

"use client";

import { curveCardinal } from "@visx/curve";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AreaChart, Area } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";

import { revenueData, type RevenuePoint } from "@/lib/mock/admin-dashboard-data";

// Convertir les RevenuePoint en format attendu par Bklit (date: Date)
const chartData = revenueData.map((pt: RevenuePoint) => ({
  date: new Date(pt.date),
  caBrut: pt.caBrut,
  commission: pt.commission,
}));

function fmtXOF(val: number) {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(val) +
    " F CFA"
  );
}

export function RevenueChart() {
  return (
    <Card
      className="border-border/60 shadow-none bg-card"
      aria-label="Revenus des 30 derniers jours — CA brut et Commission Certilys"
    >
      <CardHeader className="px-5 pt-5 pb-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Revenus — 30 derniers jours
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              Évolution du CA brut et de la commission Certilys
            </CardDescription>
          </div>
          {/* Légende */}
          <div
            className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 mt-1 sm:mt-0"
            role="list"
            aria-label="Légende du graphique"
          >
            <span className="flex items-center gap-1.5" role="listitem">
              <span
                className="inline-block h-2 w-6 rounded-full"
                style={{ backgroundColor: "var(--chart-1)" }}
                aria-hidden="true"
              />
              CA brut
            </span>
            <span className="flex items-center gap-1.5" role="listitem">
              <span
                className="inline-block h-2 w-6 rounded-full"
                style={{ backgroundColor: "var(--chart-2)" }}
                aria-hidden="true"
              />
              Commission
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-4 pt-2 sm:px-5">
        <div
          role="img"
          aria-label="Graphique en aires des revenus Certilys sur 30 jours"
        >
          <AreaChart
            aspectRatio="3 / 1"
            className="w-full"
            data={chartData}
            margin={{ top: 20, right: 16, bottom: 36, left: 16 }}
            animationDuration={900}
          >
            {/* Grille */}
            <Grid horizontal numTicksRows={4} strokeDasharray="3,3" />

            {/* Axe X */}
            <XAxis numTicks={6} />

            {/* Tooltip avec rows personnalisés */}
            <ChartTooltip
              rows={(point) => [
                {
                  label: "CA brut",
                  value: fmtXOF(point.caBrut as number),
                  color: "var(--chart-1)",
                },
                {
                  label: "Commission",
                  value: fmtXOF(point.commission as number),
                  color: "var(--chart-2)",
                },
              ]}
            />

            {/* Série Commission — gradient interne Bklit */}
            <Area
              curve={curveCardinal.tension(0.6)}
              dataKey="commission"
              fill="var(--chart-2)"
              fillOpacity={0.2}
              gradientToOpacity={0}
              stroke="var(--chart-2)"
              strokeWidth={1.5}
              showHighlight={false}
            />

            {/* Série CA brut — gradient interne Bklit */}
            <Area
              curve={curveCardinal.tension(0.6)}
              dataKey="caBrut"
              fill="var(--chart-1)"
              fillOpacity={0.3}
              gradientToOpacity={0}
              showHighlight
              stroke="var(--chart-1)"
              strokeWidth={2}
            />
          </AreaChart>
        </div>
      </CardContent>
    </Card>
  );
}

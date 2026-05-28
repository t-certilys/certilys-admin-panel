"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  revenueData,
  type RevenuePoint,
} from "@/lib/mock/admin-dashboard-data";

// Préparation des données pour le graphique
const chartData = revenueData.map((pt: RevenuePoint) => ({
  date: pt.date,
  caBrut: pt.caBrut,
  commission: pt.commission,
}));

function fmtXOF(val: number) {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(val) +
    " F CFA"
  );
}

// Tooltip personnalisé et haut de gamme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dateObj = new Date(label);
    const dateFormatted = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return (
      <div className="bg-neutral-800 text-white p-3 rounded-lg border border-neutral-700/60 shadow-lg text-xs font-sans min-w-[200px]">
        <p className="font-semibold text-neutral-400 mb-2">{dateFormatted}</p>
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any) => (
            <div
              key={entry.name}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full inline-block"
                  style={{ backgroundColor: entry.stroke || entry.color }}
                />
                <span className="text-neutral-300">{entry.name}</span>
              </div>
              <span className="font-bold tabular-nums">
                {fmtXOF(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

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

      <CardContent className="px-3 pb-4 pt-4 sm:px-5">
        <div
          role="img"
          aria-label="Graphique en aires des revenus Certilys sur 30 jours"
          className="h-[320px] w-full sm:h-[360px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="caBrutGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.22}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
                <linearGradient
                  id="commissionGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.16}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              {/* Grille */}
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
                strokeOpacity={0.4}
              />

              {/* Axes */}
              <XAxis
                dataKey="date"
                tickFormatter={(tick) => {
                  const d = new Date(tick);
                  return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                minTickGap={32}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                hide={true}
                domain={["dataMin - 20000", "dataMax + 50000"]}
              />

              {/* Info-bulle personnalisée */}
              <Tooltip content={<CustomTooltip />} />

              {/* Tracé Commission */}
              <Area
                type="monotone"
                name="Commission"
                dataKey="commission"
                stroke="var(--chart-2)"
                fill="url(#commissionGradient)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />

              {/* Tracé CA brut */}
              <Area
                type="monotone"
                name="CA brut"
                dataKey="caBrut"
                stroke="var(--chart-1)"
                fill="url(#caBrutGradient)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

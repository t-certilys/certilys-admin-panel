"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { validationData } from "@/lib/mock/admin-dashboard-data";

const SERIES = [
  { key: "candidatures", label: "Candidatures reçues", color: "var(--chart-1)" },
  { key: "formateursApprouves", label: "Formateurs approuvés", color: "var(--chart-2)" },
  { key: "formationsSoumises", label: "Formations soumises", color: "var(--chart-3)" },
  { key: "formationsApprouvees", label: "Formations approuvées", color: "var(--chart-5)" },
] as const;

export function ValidationChart() {
  return (
    <Card
      className="border-border/60 shadow-none bg-card h-full"
      aria-label="Flux de validation — Candidatures, formateurs et formations sur les 30 derniers jours"
    >
      <CardHeader className="px-5 pt-5 pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Flux de validation
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-0.5">
          Candidatures, approbations et soumissions par semaine
        </CardDescription>
      </CardHeader>

      <CardContent className="px-3 pb-5 pt-2 sm:px-5">
        <div
          role="img"
          aria-label="Graphique en barres des flux de validation par semaine"
          className="w-full"
          style={{ height: 260 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={validationData}
              margin={{ top: 8, right: 4, bottom: 4, left: -12 }}
              barCategoryGap="25%"
              barGap={2}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                width={28}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--popover-foreground)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
                itemStyle={{ color: "inherit" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                iconType="circle"
                iconSize={8}
              />
              {SERIES.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

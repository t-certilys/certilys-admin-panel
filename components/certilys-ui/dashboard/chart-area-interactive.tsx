"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const ChartAreaContent = dynamic(() => import("./chart-area-content").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="aspect-auto h-[280px] w-full sm:h-[360px] flex items-center justify-center">
      Loading...
    </div>
  ),
})

export const description = "An interactive area chart"

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("7d")

  return (
    <Card className="@container/card overflow-hidden border border-border py-0 shadow-none">
      <CardHeader className="gap-2 px-4 pt-4 sm:px-6 sm:pt-6">
        <CardTitle>Total des Visiteurs</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total pour les 3 derniers mois
          </span>
          <span className="@[540px]/card:hidden">3 derniers mois</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 derniers mois</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 derniers jours</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 derniers jours</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate sm:w-40 @[767px]/card:hidden"
              size="sm"
              aria-label="Sélectionner une période"
            >
              <SelectValue placeholder="3 derniers mois" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 derniers mois
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 derniers jours
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 derniers jours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-3 pt-2 pb-4 sm:px-6 sm:pt-4 sm:pb-8">
        <ChartAreaContent timeRange={timeRange} setTimeRange={setTimeRange} />
      </CardContent>
    </Card>
  )
}

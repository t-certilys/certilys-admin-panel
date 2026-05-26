import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardData {
  description: string
  value: string
  delta: string
  summary: string
  detail: string
  trend: IconSvgElement
}

interface SectionCardsProps {
  index?: number
}

const sectionCards: SectionCardData[] = [
  {
    description: "Revenu Total",
    value: "1 250,00 €",
    delta: "+12.5%",
    summary: "En hausse ce mois-ci",
    detail: "Visiteurs des 6 derniers mois",
    trend: ArrowUp01Icon,
  },
  {
    description: "Nouveaux Clients",
    value: "1 234",
    delta: "-20%",
    summary: "En baisse de 20% ce mois",
    detail: "L'acquisition nécessite attention",
    trend: ArrowDown01Icon,
  },
  {
    description: "Comptes Actifs",
    value: "45 678",
    delta: "+12.5%",
    summary: "Forte rétention d'utilisateurs",
    detail: "L'engagement dépasse les cibles",
    trend: ArrowUp01Icon,
  },
  {
    description: "Taux de Croissance",
    value: "4.5%",
    delta: "+4.5%",
    summary: "Performance stable en hausse",
    detail: "Conforme aux projections",
    trend: ArrowUp01Icon,
  },
]

function SectionCard({ card }: { card: SectionCardData }) {
  return (
    <Card className="@container/card h-full border-0 py-0 ring-0 shadow-none">
      <CardHeader className="pt-4">
        <CardDescription>{card.description}</CardDescription>
        <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl @[250px]/card:text-3xl">
          {card.value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <HugeiconsIcon icon={card.trend} size={20} strokeWidth={1.5} />
            {card.delta}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="mt-auto flex-col items-start gap-1.5 rounded-none border-t bg-muted/40 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {card.summary}
          <HugeiconsIcon icon={card.trend} size={20} strokeWidth={1.5} />
        </div>
        <div className="text-muted-foreground">{card.detail}</div>
      </CardFooter>
    </Card>
  )
}

export function SectionCards({ index }: SectionCardsProps) {
  if (typeof index === "number") {
    return <SectionCard card={sectionCards[index]} />
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {sectionCards.map((card) => (
        <SectionCard key={card.description} card={card} />
      ))}
    </div>
  )
}

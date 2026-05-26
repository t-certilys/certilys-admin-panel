import { SectionCards } from "@/components/certilys-ui/dashboard/section-cards";
import { ChartAreaInteractive } from "@/components/certilys-ui/dashboard/chart-area-interactive";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 py-4 lg:gap-8 lg:py-6 @container/main">
      {/* Statistiques principales en haut */}
      <SectionCards />

      {/* Graphique interactif au milieu */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  );
}

import Link from "next/link";
import { Download01Icon, CheckmarkSquare01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

export function AdminDashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-4 lg:px-6">
      {/* Titre + sous-titre */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-sora">
          Tableau de bord
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Vue rapide de l&apos;activité, des validations et des revenus Certilys.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          id="btn-export-csv"
          variant="outline"
          size="sm"
          className="gap-2 border-border text-foreground hover:bg-muted"
          aria-label="Exporter les données au format CSV"
        >
          <HugeiconsIcon icon={Download01Icon} className="size-4" size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Exporter CSV</span>
        </Button>

        <Button
          id="btn-voir-validations"
          asChild
          size="sm"
          className="gap-2"
        >
          <Link
            href="/dashboard/courses"
            aria-label="Accéder à la liste des formations à valider"
          >
            <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4" size={16} strokeWidth={1.5} aria-hidden="true" />
            <span>Voir les validations</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

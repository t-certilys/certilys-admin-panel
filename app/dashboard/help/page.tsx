import {
  HelpCircleIcon,
  InformationCircleIcon,
  GithubIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShortcutsList } from "@/components/certilys-ui/dashboard/shortcuts-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HelpPage() {
  const env =
    process.env.NODE_ENV === "development" ? "Développement" : "Production";

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
          <HugeiconsIcon
            icon={HelpCircleIcon}
            size={22}
            strokeWidth={1.5}
            className="text-primary shrink-0"
          />
          Centre d'Aide
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Trouvez de l'aide et découvrez les raccourcis pour naviguer plus
          rapidement.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:flex-1 min-w-0">
          <div className="rounded-xl border border-border/50 bg-card/40 p-4 sm:p-6">
            <h3 className="text-base font-medium mb-1">Raccourcis Clavier</h3>
            <p className="text-sm text-muted-foreground mb-5">
              L'application supporte plusieurs raccourcis clavier pour vous
              faire gagner du temps. Vous pouvez également maintenir{" "}
              <kbd className="pointer-events-none inline-flex h-5 items-center justify-center rounded-sm bg-muted px-1.5 font-sans text-[10px] font-medium text-muted-foreground uppercase">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="pointer-events-none inline-flex h-5 items-center justify-center rounded-sm bg-muted px-1.5 font-sans text-[10px] font-medium text-muted-foreground uppercase">
                Alt
              </kbd>{" "}
              +{" "}
              <kbd className="pointer-events-none inline-flex h-5 items-center justify-center rounded-sm bg-muted px-1.5 font-sans text-[10px] font-medium text-muted-foreground uppercase">
                O
              </kbd>{" "}
              depuis n'importe où pour afficher cette liste.
            </p>
            <ShortcutsList />
          </div>
        </div>

        <div className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="rounded-xl border border-border/50 bg-card/40 p-4 sm:p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  size={20}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-base font-medium">À propos du système</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-border/40 gap-4">
                <span className="text-sm text-muted-foreground shrink-0">
                  Version
                </span>
                <span className="text-sm font-medium">v0.1.0</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40 gap-4">
                <span className="text-sm text-muted-foreground shrink-0">
                  Environnement
                </span>
                <Badge
                  variant={
                    process.env.NODE_ENV === "development"
                      ? "secondary"
                      : "default"
                  }
                  className="h-5 px-1.5"
                >
                  {env}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40 gap-4">
                <span className="text-sm text-muted-foreground shrink-0">
                  Membre depuis
                </span>
                <span className="text-sm font-medium">Mai 2026</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40 gap-4">
                <span className="text-sm text-muted-foreground shrink-0">
                  Dernier patch
                </span>
                <span className="text-sm font-medium">Aujourd'hui</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 border-border/50 bg-transparent hover:bg-muted/50"
              asChild
            >
              <a
                href="https://github.com/Joyboy-dy/certilys-admin-panel"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HugeiconsIcon icon={GithubIcon} size={16} strokeWidth={1.5} />
                Dépôt GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Coins01Icon,
  Home01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryState } from "nuqs";

import { LeonoCreditPacksDialog } from "@/components/certilys-ui/orders/leono-credit-packs-dialog";
import { SiteConfigurationPage } from "@/components/certilys-ui/site-configuration/site-configuration-page";
import { TesterManagementPage } from "@/components/certilys-ui/site-configuration/tester-management-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ConfigurationCardProps = {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
};

export function SiteConfigurationHub() {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "home",
    clearOnDefault: true,
  });
  const [leonoOpen, setLeonoOpen] = React.useState(false);

  const activeTab =
    tab === "landing" || tab === "referentiels" || tab === "testers"
      ? tab
      : "home";

  if (activeTab === "testers") {
    return <TesterManagementPage onBack={() => void setTab("home")} />;
  }

  if (activeTab !== "home") {
    return (
      <div className="flex flex-col">
        <div className="px-4 pt-6 lg:px-6">
          <Button
            type="button"
            variant="ghost"
            className="-ml-2 gap-2"
            onClick={() => void setTab("home")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            Retour aux configurations
          </Button>
        </div>
        <SiteConfigurationPage />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-7 px-4 py-6 lg:px-6">
        <div className="space-y-1">
          <h1 className="font-sora text-2xl font-semibold tracking-tight text-foreground">
            Configurations du site
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Centralisez ici les réglages du contenu public, des référentiels et
            des services Certilys. Cette section accueillera progressivement de
            nouvelles options.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ConfigurationCard
            title="Landing Page"
            description="Gérez les contenus de la page d’accueil et les formateurs vérifiés mis en avant sur la landing publique."
            icon={Home01Icon}
            onClick={() => void setTab("landing")}
          />

          <ConfigurationCard
            title="Domaines d’expertise"
            description="Pilotez les domaines proposés aux formateurs pendant l’onboarding et dans leurs profils."
            icon={UserGroupIcon}
            onClick={() => void setTab("referentiels")}
          />

          <ConfigurationCard
            title="Gestion des packs Léono"
            description="Configurez les packs de crédits Léono, leurs montants, leur disponibilité et le pack recommandé."
            icon={Coins01Icon}
            onClick={() => setLeonoOpen(true)}
          />

          <ConfigurationCard
            title="Comptes testeurs"
            description="Désignez les apprenants autorisés à explorer les formations masquées du catalogue."
            icon={UserGroupIcon}
            onClick={() => void setTab("testers")}
          />
        </div>
      </div>

      <LeonoCreditPacksDialog
        open={leonoOpen}
        onOpenChange={setLeonoOpen}
      />
    </>
  );
}

function ConfigurationCard({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  badge,
}: ConfigurationCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group relative flex min-h-56 w-full overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-emerald-500/10 via-background to-blue-500/10 p-6 text-left shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-65 disabled:hover:translate-y-0 disabled:hover:border-border/70 disabled:hover:shadow-sm sm:p-7"
    >
      <span className="absolute -right-12 -top-14 size-40 rounded-full bg-primary/5 blur-2xl transition-transform duration-300 group-hover:scale-110 group-disabled:scale-100" />

      <span className="relative flex w-full flex-col gap-5">
        <span className="flex items-start justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl border border-border/70 bg-background/85 text-foreground shadow-sm backdrop-blur-sm">
            <HugeiconsIcon icon={icon} className="size-6" />
          </span>

          {badge ? (
            <Badge variant="secondary" className="font-normal">
              {badge}
            </Badge>
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          )}
        </span>

        <span className="mt-auto space-y-2">
          <span className="block font-sora text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </span>
          <span className="block max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </span>
        </span>
      </span>
    </button>
  );
}

"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon, ViewIcon, Notification01Icon } from "@hugeicons/core-free-icons";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const privacyOptions = [
  {
    title: "Visibilité du profil",
    description: "Choisir qui peut voir votre profil et vos informations publiques.",
    icon: ViewIcon,
    defaultChecked: true,
  },
  {
    title: "Partage des données analytiques",
    description: "Autoriser l'envoi de données anonymisées pour améliorer la plateforme.",
    icon: Shield01Icon,
    defaultChecked: false,
  },
  {
    title: "Notifications sensibles",
    description: "Recevoir des alertes pour les modifications critiques de confidentialité.",
    icon: Notification01Icon,
    defaultChecked: true,
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vie privée</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Contrôlez la visibilité de vos informations et vos préférences de confidentialité.
        </p>
      </div>

      <div className="grid gap-4">
        {privacyOptions.map((option) => (
          <Card key={option.title} className="border border-border/50 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <HugeiconsIcon icon={option.icon} size={18} strokeWidth={1.5} />
                {option.title}
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-end">
                <Switch defaultChecked={option.defaultChecked} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

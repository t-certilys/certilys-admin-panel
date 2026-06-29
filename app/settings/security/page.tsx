"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  Loading02Icon,
  LockKeyIcon,
  Logout01Icon,
  Shield01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  getAdminSecurityOverviewAction,
  revokeOtherAdminSessionsAction,
  type AdminSecurityOverview,
} from "@/lib/admin-security-actions";

const providerLabels: Record<string, string> = {
  EMAIL: "Connexion par e-mail",
  email: "Connexion par e-mail",
  google: "Connexion Google",
  GOOGLE: "Connexion Google",
};

function formatDateTime(value?: string | null) {
  if (!value) return "Jamais";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Date indisponible";
  }
}

function iconForDevice(label: string) {
  return /iOS|Android/i.test(label) ? SmartPhone01Icon : ComputerIcon;
}

export default function SecurityPage() {
  const [overview, setOverview] = React.useState<AdminSecurityOverview | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRevoking, setIsRevoking] = React.useState(false);

  const loadSecurity = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminSecurityOverviewAction();
      setOverview(data);
      if (!data) {
        toast.error("Session administrateur expirée.");
      }
    } catch {
      toast.error("Impossible de charger les paramètres de sécurité.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSecurity();
  }, [loadSecurity]);

  const revokeOtherSessions = React.useCallback(async () => {
    setIsRevoking(true);
    try {
      const result = await revokeOtherAdminSessionsAction();
      if (result.success) {
        toast.success(result.message);
        await loadSecurity();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsRevoking(false);
    }
  }, [loadSecurity]);

  const otherSessionsCount = Math.max((overview?.visibleSessionsCount ?? 0) - 1, 0);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sécurité et confidentialité
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Gérez la double authentification et surveillez les appareils connectés à votre compte.
        </p>
      </div>

      <div className="grid gap-8">
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={LockKeyIcon} size={20} strokeWidth={1.5} />
              Méthode de connexion
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Le panel administrateur utilise une connexion sans mot de passe avec OTP ou Google.
            </p>
          </div>

          <Card className="border border-border/50 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Identité de connexion
              </CardTitle>
              <CardDescription>
                Les mots de passe ne sont pas utilisés pour les comptes administrateurs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <p className="text-sm font-medium">
                  {providerLabels[overview?.authProvider ?? ""] ?? "Méthode sécurisée"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Vérification par code e-mail puis double authentification obligatoire.
                </p>
              </div>
              <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20">
                Mot de passe désactivé
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border/50" />

        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={Shield01Icon} size={20} strokeWidth={1.5} />
              Double authentification
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              La 2FA est obligatoire pour accéder aux actions sensibles du panel.
            </p>
          </div>

          <Card className="border border-border/50 bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <HugeiconsIcon
                      icon={Shield01Icon}
                      size={20}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      Application d’authentification
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {overview?.twoFactorEnabled
                        ? `Activée depuis le ${formatDateTime(overview.twoFactorConfirmedAt)}.`
                        : "Configuration requise avant d’accéder au dashboard."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!overview?.twoFactorEnabled && (
                    <Button asChild size="sm">
                      <Link href="/auth/2fa/setup">Configurer</Link>
                    </Button>
                  )}
                  <Switch checked={Boolean(overview?.twoFactorEnabled)} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border/50" />

        <div className="grid gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <HugeiconsIcon
                  icon={SmartPhone01Icon}
                  size={20}
                  strokeWidth={1.5}
                />
                Sessions actives
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Les sessions sont regroupées par appareil et navigateur pour éviter les doublons visuels.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={revokeOtherSessions}
              disabled={isLoading || isRevoking || otherSessionsCount === 0}
              className="gap-2"
            >
              {isRevoking ? (
                <HugeiconsIcon icon={Loading02Icon} size={16} className="animate-spin" />
              ) : (
                <HugeiconsIcon icon={Logout01Icon} size={16} />
              )}
              Déconnecter les autres sessions
            </Button>
          </div>

          <div className="grid gap-3">
            {isLoading &&
              Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 rounded-xl border border-border/50 bg-muted/30 animate-pulse"
                />
              ))}

            {!isLoading && overview?.sessions.length === 0 && (
              <Card className="border border-border/50 bg-muted/20">
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Aucune session active trouvée.
                </CardContent>
              </Card>
            )}

            {!isLoading &&
              overview?.sessions.map((session) => {
                const Icon = iconForDevice(session.deviceLabel);
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card transition-all hover:border-primary/20"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                        <HugeiconsIcon
                          icon={Icon}
                          size={20}
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="grid gap-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {session.deviceLabel}
                          </span>
                          {session.isCurrent && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 py-0 bg-primary/5 text-primary border-primary/20"
                            >
                              Session actuelle
                            </Badge>
                          )}
                          {session.sessionCount > 1 && (
                            <Badge variant="secondary" className="text-[10px] h-4 py-0">
                              {session.sessionCount} sessions regroupées
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {session.ipAddress ?? "IP inconnue"} · dernière activité : {formatDateTime(session.lastActiveAt)}
                        </span>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <HugeiconsIcon
                        icon={Logout01Icon}
                        size={18}
                        strokeWidth={1.5}
                        className="text-muted-foreground"
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

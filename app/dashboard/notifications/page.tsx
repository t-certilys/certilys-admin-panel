"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RotateCw,
  Info,
  Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Structure d'une notification
interface Notification {
  id: string;
  title: string;
  description: string;
  category: "formation" | "paiement" | "systeme" | "utilisateur";
  createdAt: string;
  isRead: boolean;
}

// Données mockées Certilys
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Nouvelle inscription formateur",
    description: "Jean Dupont a postulé en tant que formateur expert en cybersécurité.",
    category: "utilisateur",
    createdAt: "Il y a 10 min",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "Paiement validé",
    description: "La commande CMD-2026-9482 d'un montant de 1 490,00 € a été payée avec succès.",
    category: "paiement",
    createdAt: "Il y a 1 heure",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "Session de formation validée",
    description: "La formation 'Certification Réseaux Cloud' a atteint le quota minimum d'inscrits et est confirmée.",
    category: "formation",
    createdAt: "Il y a 3 heures",
    isRead: false,
  },
  {
    id: "notif-4",
    title: "Mise à jour du système planifiée",
    description: "Une maintenance de la base de données aura lieu ce soir entre 02:00 et 04:00 UTC.",
    category: "systeme",
    createdAt: "Hier",
    isRead: true,
  },
  {
    id: "notif-5",
    title: "Rapport d'audit de sécurité généré",
    description: "Le journal des audits de la semaine dernière a été compilé et est prêt pour analyse.",
    category: "systeme",
    createdAt: "Il y a 2 jours",
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "empty">("idle");

  // Filtrage des notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  // Nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Actions interactives
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleResetMockData = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
    setStatus("idle");
  };

  // Icône et couleur selon la catégorie
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "formation":
        return { bg: "bg-blue-500/10 text-blue-500", label: "Formation" };
      case "paiement":
        return { bg: "bg-emerald-500/10 text-emerald-500", label: "Paiement" };
      case "systeme":
        return { bg: "bg-amber-500/10 text-amber-500", label: "Système" };
      case "utilisateur":
      default:
        return { bg: "bg-purple-500/10 text-purple-500", label: "Utilisateur" };
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 py-6 px-4 lg:px-8 max-w-5xl mx-auto w-full pb-24">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Gérez vos alertes d&apos;administration, inscriptions et activités du système Certilys.
          </p>
        </div>


      </div>

      {/* Rendu dynamique basé sur l'état simulé */}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary animate-bounce">
            <Bell className="size-6 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Chargement de vos notifications...</p>
        </div>
      )}

      {status === "error" && (
        <Card className="border border-destructive/20 bg-destructive/5 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center gap-4">
            <div className="rounded-full bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="size-8" />
            </div>
            <div className="grid gap-1">
              <h3 className="font-semibold text-lg">Une erreur est survenue</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Impossible de récupérer vos notifications depuis le serveur Certilys. Veuillez réessayer.
              </p>
            </div>
            <Button onClick={() => setStatus("idle")} size="sm" className="gap-2 shadow-xs">
              <RotateCw className="size-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "empty" || (status === "idle" && filteredNotifications.length === 0) ? (
        <Card className="border border-border bg-card/45 backdrop-blur-xs">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center gap-4">
            <div className="rounded-full bg-muted/60 p-5 text-muted-foreground">
              <BellOff className="size-9" />
            </div>
            <div className="grid gap-1">
              <h3 className="font-semibold text-lg">Aucune notification</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {filter === "unread"
                  ? "Vous n'avez pas de notifications non lues pour le moment."
                  : "Votre boîte de réception est complètement vide. Tout est en ordre !"}
              </p>
            </div>
            {notifications.length === 0 && (
              <Button variant="outline" size="sm" onClick={handleResetMockData} className="mt-2">
                Restaurer les données simulées
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}

      {status === "idle" && filteredNotifications.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Actions & Onglets */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1.5 bg-muted/30 border p-1 rounded-lg w-fit">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"}
              >
                Toutes ({notifications.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter("unread")}
                className={filter === "unread" ? "bg-background shadow-xs font-semibold" : "text-muted-foreground"}
              >
                Non lues ({unreadCount})
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-1.5 text-xs h-9">
                  <CheckCircle2 className="size-4" />
                  Tout marquer comme lu
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="gap-1.5 text-xs text-muted-foreground hover:text-destructive h-9">
                  <Trash2 className="size-4" />
                  Effacer tout
                </Button>
              )}
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="grid gap-3">
            {filteredNotifications.map((notif) => {
              const styles = getCategoryStyles(notif.category);
              return (
                <Card
                  key={notif.id}
                  className={`border border-border/60 transition-all duration-200 hover:shadow-xs hover:border-border ${
                    !notif.isRead ? "bg-primary/5/30 border-l-2 border-l-primary" : "bg-card"
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex gap-4">
                    {/* Badge Catégorie / Icône */}
                    <div className={`rounded-xl p-3 shrink-0 flex items-center justify-center h-11 w-11 ${styles.bg}`}>
                      <Bell className="size-5" />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 grid gap-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm sm:text-base text-foreground leading-tight">
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                          )}
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-semibold bg-muted/60 uppercase tracking-wider">
                            {styles.label}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                          {notif.createdAt}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pr-6">
                        {notif.description}
                      </p>
                    </div>

                    {/* Actions sur l'item */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 shrink-0 self-center">
                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                          aria-label="Marquer comme lu"
                          title="Marquer comme lu"
                        >
                          <Check className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(notif.id)}
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        aria-label="Supprimer"
                        title="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Info API future */}
      <Card className="border border-border/40 bg-muted/10">
        <CardContent className="p-4 flex gap-3 items-start">
          <Info className="text-muted-foreground shrink-0 mt-0.5 size-[18px]" />
          <div className="grid gap-1">
            <span className="text-xs font-semibold text-foreground">Préparation de l&apos;intégration backend</span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Cette interface est prête pour être connectée au backend. Les endpoints API prévus sont : 
              <code className="mx-1 bg-muted px-1 py-0.5 rounded text-[10px] text-primary">GET /admin/notifications</code>, 
              <code className="mx-1 bg-muted px-1 py-0.5 rounded text-[10px] text-primary">PATCH /admin/notifications/:id/read</code>, et 
              <code className="mx-1 bg-muted px-1 py-0.5 rounded text-[10px] text-primary">PATCH /admin/notifications/read-all</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

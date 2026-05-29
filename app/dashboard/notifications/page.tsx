"use client";

import * as React from "react";
import {
  Notification01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  InvoiceIcon,
  Book01Icon,
  Cancel01Icon,
  Loading02Icon,
  InboxIcon,
  SearchRemoveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFilter, type FilterField } from "@/components/ui/search-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─────────────────────────────────────────────────────────────────────────────
// Structure d'une notification et données Certilys
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: "formation" | "paiement" | "systeme" | "utilisateur";
  severity: "info" | "warning" | "critical";
  createdAt: string;
  isRead: boolean;
}

// Les dates sont pré-formatées pour être identiques SSR / client (pas de toLocaleDateString au rendu)
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Nouvelle inscription formateur",
    description: "Jean Dupont a postulé en tant que formateur expert en cybersécurité.",
    category: "utilisateur",
    severity: "info",
    createdAt: "29/05/2026, 09:30",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "Échec de paiement critique",
    description: "La transaction pour la commande CMD-2026-9501 a échoué après 3 tentatives.",
    category: "paiement",
    severity: "critical",
    createdAt: "29/05/2026, 08:15",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "Paiement validé",
    description: "La commande CMD-2026-9482 d'un montant de 1 490,00 € a été payée avec succès.",
    category: "paiement",
    severity: "info",
    createdAt: "29/05/2026, 07:45",
    isRead: false,
  },
  {
    id: "notif-4",
    title: "Demande de validation de formation",
    description: "Le formateur Thomas Dubois a soumis le cours 'Cybersécurité Avancée' pour validation.",
    category: "formation",
    severity: "warning",
    createdAt: "29/05/2026, 05:30",
    isRead: false,
  },
  {
    id: "notif-5",
    title: "Mise à jour du système planifiée",
    description: "Une maintenance de la base de données aura lieu ce soir entre 02:00 et 04:00 UTC.",
    category: "systeme",
    severity: "info",
    createdAt: "28/05/2026, 18:00",
    isRead: true,
  },
  {
    id: "notif-6",
    title: "Rapport d'audit de sécurité généré",
    description: "Le journal des audits de la semaine dernière a été compilé et est prêt pour analyse.",
    category: "systeme",
    severity: "info",
    createdAt: "27/05/2026, 14:20",
    isRead: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page Notifications
// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchValue, setSearchValue] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({
    category: "",
    severity: "",
    status: "",
  });

  const [loading, setLoading] = React.useState(true);
  const [actionPending, setActionPending] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Calcul des KPIs compacts
  const kpis = React.useMemo(() => {
    return {
      unread: notifications.filter((n) => !n.isRead).length,
      critical: notifications.filter((n) => n.severity === "critical" && !n.isRead).length,
      payments: notifications.filter((n) => n.category === "paiement").length,
      validations: notifications.filter((n) => n.category === "formation").length,
    };
  }, [notifications]);

  // Filtrage des notifications
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      const q = searchValue.toLowerCase().trim();
      if (q && !n.title.toLowerCase().includes(q) && !n.description.toLowerCase().includes(q)) {
        return false;
      }
      if (filterValues.category && n.category !== filterValues.category) return false;
      if (filterValues.severity && n.severity !== filterValues.severity) return false;
      if (filterValues.status === "unread" && n.isRead) return false;
      if (filterValues.status === "read" && !n.isRead) return false;
      return true;
    });
  }, [notifications, searchValue, filterValues]);

  // Actions
  async function handleMarkAsRead(id: string) {
    setActionPending(id);
    await new Promise((r) => setTimeout(r, 300));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    console.log("[ENDPOINT API MOCK] PATCH /admin/notifications/:id/read SUCCESS", id);
    setActionPending(null);
  }

  async function handleMarkAllAsRead() {
    setActionPending("all-read");
    await new Promise((r) => setTimeout(r, 500));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    console.log("[ENDPOINT API MOCK] PATCH /admin/notifications/read-all SUCCESS");
    setActionPending(null);
  }

  async function handleDelete(id: string) {
    setActionPending(`delete-${id}`);
    await new Promise((r) => setTimeout(r, 300));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    console.log("[ENDPOINT API MOCK] DELETE /admin/notifications/:id SUCCESS", id);
    setActionPending(null);
  }

  // Configuration des filtres légers pour SearchFilter
  const filters: FilterField[] = [
    {
      id: "status",
      label: "Lecture",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-status-notif" className="w-full">
            <SelectValue placeholder="Toutes les notifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unread">Non lues</SelectItem>
            <SelectItem value="read">Lues</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "category",
      label: "Catégorie",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-cat-notif" className="w-full">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="utilisateur">Utilisateur</SelectItem>
            <SelectItem value="paiement">Paiement</SelectItem>
            <SelectItem value="formation">Formation</SelectItem>
            <SelectItem value="systeme">Système</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "severity",
      label: "Gravité",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-sev-notif" className="w-full">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Avertissement</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  // Styles de catégories
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "formation":
        return {
          icon: Book01Icon,
          bg: "bg-blue-500/10 text-blue-500",
          label: "Formation",
        };
      case "paiement":
        return {
          icon: InvoiceIcon,
          bg: "bg-emerald-500/10 text-emerald-500",
          label: "Paiement",
        };
      case "systeme":
        return {
          icon: AlertCircleIcon,
          bg: "bg-amber-500/10 text-amber-500",
          label: "Système",
        };
      case "utilisateur":
      default:
        return {
          icon: Notification01Icon,
          bg: "bg-purple-500/10 text-purple-500",
          label: "Utilisateur",
        };
    }
  };

  const activeFilterCount = Object.values(filterValues).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      {/* ── 1. Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-sora">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Alertes opérationnelles et événements importants du back-office Certilys.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {kpis.unread > 0 && (
            <Button
              id="btn-mark-all-read"
              variant="outline"
              size="sm"
              className="gap-2 border-border text-foreground hover:bg-muted"
              onClick={handleMarkAllAsRead}
              disabled={actionPending === "all-read"}
            >
              {actionPending === "all-read" ? (
                <HugeiconsIcon icon={Loading02Icon} className="size-4 animate-spin" size={16} strokeWidth={1.5} />
              ) : (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500" size={16} strokeWidth={1.5} />
              )}
              <span>Tout marquer comme lu</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── 2. KPI compacts ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Non lues */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <HugeiconsIcon icon={Notification01Icon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.unread}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Non lues</p>
            </div>
          </CardContent>
        </Card>

        {/* Critiques */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.critical}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Non lues critiques</p>
            </div>
          </CardContent>
        </Card>

        {/* Paiements */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <HugeiconsIcon icon={InvoiceIcon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.payments}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Paiements liés</p>
            </div>
          </CardContent>
        </Card>

        {/* Validations */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <HugeiconsIcon icon={Book01Icon} className="size-4" size={16} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">
                {loading ? <Skeleton className="h-6 w-8" /> : kpis.validations}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Demandes de validation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Recherche + Filtres ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <SearchFilter
          placeholder="Rechercher une alerte ou description…"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filters}
          filterValues={filterValues}
          onFiltersApply={setFilterValues}
          onFiltersReset={() => setFilterValues({ category: "", severity: "", status: "" })}
          sheetTitle="Filtrer les notifications"
          className="w-full max-w-sm"
        />
        {activeFilterCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {filteredNotifications.length} résultat{filteredNotifications.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── 4. Liste de Notifications sobres ─────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border border-border/60 shadow-none">
              <CardContent className="p-4 flex gap-3">
                <Skeleton className="size-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}

        {!loading && filteredNotifications.length === 0 && (
          <Card className="border border-border/60 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon icon={searchValue ? SearchRemoveIcon : InboxIcon} className="size-6 text-muted-foreground" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {searchValue ? "Aucune alerte correspondante" : "Boîte de réception vide"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {searchValue ? "Modifiez vos critères de filtrage." : "Toutes les alertes opérationnelles ont été traitées !"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading &&
          filteredNotifications.map((notif) => {
            const cfg = getCategoryStyles(notif.category);
            const isUnread = !notif.isRead;
            const isCritical = notif.severity === "critical";
            const isDeleting = actionPending === `delete-${notif.id}`;
            const isReading = actionPending === notif.id;

            return (
              <Card
                key={notif.id}
                className={`border border-border/50 shadow-none transition-all duration-200 hover:border-border/80 ${
                  isUnread ? "bg-muted/10 border-l-2 border-l-primary" : "bg-card"
                }`}
              >
                <CardContent className="p-4 flex gap-3.5 items-start">
                  {/* Icône Catégorie */}
                  <div className={`size-9 rounded-lg shrink-0 flex items-center justify-center ${cfg.bg}`}>
                    <HugeiconsIcon icon={cfg.icon} className="size-4.5" size={18} strokeWidth={1.5} />
                  </div>

                  {/* Corps de la notification */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium leading-none ${isUnread ? "text-foreground font-semibold" : "text-foreground/90"}`}>
                          {notif.title}
                        </span>
                        {isUnread && (
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isCritical ? "bg-red-500 animate-pulse" : "bg-primary animate-pulse"}`} />
                        )}
                        {isCritical && (
                          <Badge variant="destructive" className="text-[10px] py-0 px-1 font-semibold uppercase tracking-wider">
                            Critique
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {notif.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pr-4">
                      {notif.description}
                    </p>
                  </div>

                  {/* Actions de l'item */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                        disabled={isReading}
                        onClick={() => handleMarkAsRead(notif.id)}
                        aria-label="Marquer la notification comme lue"
                        title="Marquer comme lu"
                      >
                        {isReading ? (
                          <HugeiconsIcon icon={Loading02Icon} className="size-3.5 animate-spin" size={14} strokeWidth={1.5} />
                        ) : (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" size={14} strokeWidth={1.5} />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                      disabled={isDeleting}
                      onClick={() => handleDelete(notif.id)}
                      aria-label="Supprimer la notification"
                      title="Supprimer"
                    >
                      {isDeleting ? (
                        <HugeiconsIcon icon={Loading02Icon} className="size-3.5 animate-spin" size={14} strokeWidth={1.5} />
                      ) : (
                        <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" size={14} strokeWidth={1.5} />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* ── 5. Pied de page: Intégration backend ────────────────────────────── */}
      <Card className="border border-border/40 bg-muted/10 mt-2">
        <CardContent className="p-4 flex gap-3 items-start">
          <HugeiconsIcon icon={AlertCircleIcon} className="text-muted-foreground shrink-0 mt-0.5 size-4" size={16} strokeWidth={1.5} />
          <div className="grid gap-0.5">
            <span className="text-xs font-semibold text-foreground">Préparation de l&apos;intégration backend</span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Cette interface de supervision opérationnelle est prête pour l&apos;intégration finale de l&apos;API de notifications.
              Les endpoints prévus sont : 
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

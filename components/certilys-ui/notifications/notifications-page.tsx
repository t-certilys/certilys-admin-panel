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
import { toast } from "sonner";

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
import {
  deleteAdminNotificationAction,
  markAdminNotificationAsReadAction,
  markAllAdminNotificationsAsReadAction,
  type AdminNotificationItem,
} from "@/lib/admin-notifications-actions";

// ─────────────────────────────────────────────────────────────────────────────
// Structure d'une notification et données Certilys
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Page Notifications
// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationsPage({
  initialNotifications,
}: {
  initialNotifications: AdminNotificationItem[];
}) {
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [searchValue, setSearchValue] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({
    category: "",
    severity: "",
    status: "",
  });

  const [loading] = React.useState(false);
  const [actionPending, setActionPending] = React.useState<string | null>(null);

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
    try {
      await markAdminNotificationAsReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de marquer cette notification comme lue.",
      );
    } finally {
      setActionPending(null);
    }
  }

  async function handleMarkAllAsRead() {
    setActionPending("all-read");
    try {
      await markAllAdminNotificationsAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de marquer les notifications comme lues.",
      );
    } finally {
      setActionPending(null);
    }
  }

  async function handleDelete(id: string) {
    setActionPending(`delete-${id}`);
    try {
      await deleteAdminNotificationAction(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer cette notification.",
      );
    } finally {
      setActionPending(null);
    }
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

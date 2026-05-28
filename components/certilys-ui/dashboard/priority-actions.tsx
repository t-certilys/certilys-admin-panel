import Link from "next/link";
import { ChevronRight, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type PriorityAction, type ActionUrgency } from "@/lib/mock/admin-dashboard-data";

// ─── Config urgence ──────────────────────────────────────────────────────────

const urgencyConfig: Record<
  ActionUrgency,
  {
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    iconClass: string;
    badgeClass: string;
    badgeLabel: string;
  }
> = {
  critical: {
    icon: AlertCircle,
    iconClass: "text-destructive",
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
    badgeLabel: "Critique",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    badgeLabel: "Attention",
  },
  info: {
    icon: Info,
    iconClass: "text-muted-foreground",
    badgeClass: "border-border bg-muted text-muted-foreground",
    badgeLabel: "Info",
  },
};

// ─── Single Action Row ───────────────────────────────────────────────────────

function ActionRow({ action }: { action: PriorityAction }) {
  const cfg = urgencyConfig[action.urgency];
  const Icon = cfg.icon;

  return (
    <Link
      href={action.href}
      id={`priority-action-${action.id}`}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`${action.label} — ${action.count} élément${action.count > 1 ? "s" : ""} — Urgence : ${cfg.badgeLabel}`}
    >
      {/* Icône urgence */}
      <Icon
        className={`size-4 shrink-0 ${cfg.iconClass}`}
        aria-hidden={true}
      />

      {/* Label */}
      <span className="flex-1 text-sm text-foreground leading-snug">
        {action.label}
      </span>

      {/* Badge compteur */}
      <Badge
        variant="outline"
        className={`min-w-[1.75rem] justify-center text-xs font-semibold px-2 py-0.5 ${cfg.badgeClass}`}
        aria-label={`${action.count} élément${action.count > 1 ? "s" : ""}`}
      >
        {action.count}
      </Badge>

      {/* Chevron */}
      <ChevronRight
        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden={true}
      />
    </Link>
  );
}

// ─── Priority Actions Block ──────────────────────────────────────────────────

export function PriorityActions({ actions }: { actions: PriorityAction[] }) {
  return (
    <Card className="border-border/60 shadow-none bg-card h-full">
      <CardHeader className="px-5 pt-5 pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Actions prioritaires
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-4 pt-1">
        <nav aria-label="Actions prioritaires nécessitant une attention immédiate">
          <ul className="flex flex-col gap-0.5" role="list">
            {actions.map((action) => (
              <li key={action.id}>
                <ActionRow action={action} />
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
}

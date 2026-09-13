"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Loading03Icon,
  VideoOffIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import type {
  PreviewVideo,
  RevisionChange,
} from "@/lib/courses/course-review.types";
import { cn } from "@/lib/utils";

export const CHANGE_STYLES: Record<
  RevisionChange,
  { label: string; symbol: string; badge: string; mark: string; row: string }
> = {
  ADDED: {
    label: "Nouveau",
    symbol: "+",
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    mark: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    row: "border-l-emerald-500",
  },
  UPDATED: {
    label: "Modifié",
    symbol: "~",
    badge: "border-primary/40 bg-primary/10 text-primary",
    mark: "bg-primary/15 text-primary",
    row: "border-l-primary",
  },
  REMOVED: {
    label: "Retiré",
    symbol: "−",
    badge: "border-destructive/40 bg-destructive/10 text-destructive",
    mark: "bg-destructive/15 text-destructive",
    row: "border-l-destructive",
  },
};

export function ChangeBadge({
  change,
  className,
}: {
  change: RevisionChange | null;
  className?: string;
}) {
  if (!change) return null;
  const style = CHANGE_STYLES[change];
  return (
    <Badge
      variant="outline"
      className={cn("px-2 py-0.5 text-[11px] font-medium", style.badge, className)}
    >
      {style.label}
    </Badge>
  );
}

export function ChangeMark({ change }: { change: RevisionChange }) {
  const style = CHANGE_STYLES[change];
  return (
    <span
      aria-label={style.label}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded font-mono text-xs font-bold",
        style.mark,
      )}
    >
      {style.symbol}
    </span>
  );
}

export function formatSeconds(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest}`;
}

export function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

const PROCESSING_STATUSES = new Set(["PENDING_UPLOAD", "UPLOADING", "PROCESSING"]);

/** Etat lisible d'une video, pour les pastilles du programme. */
export function videoState(video: PreviewVideo | null) {
  if (!video) return { label: "Sans vidéo", tone: "muted" as const };
  if (video.status === "READY" && video.embedUrl) {
    return { label: "Vidéo prête", tone: "ready" as const };
  }
  if (PROCESSING_STATUSES.has(video.status)) {
    return { label: "Vidéo en traitement", tone: "pending" as const };
  }
  return { label: "Vidéo indisponible", tone: "error" as const };
}

/**
 * Lecteur Bunny natif, comme cote apprenant. Aucune progression n'est
 * enregistree : l'administration regarde sans etre inscrite.
 */
export function VideoStage({
  video,
  title,
  className,
}: {
  video: PreviewVideo | null;
  title: string;
  className?: string;
}) {
  const state = videoState(video);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-950 text-zinc-100",
        className,
      )}
    >
      {state.tone === "ready" && video?.embedUrl ? (
        <iframe
          key={video.embedUrl}
          src={embedSource(video.embedUrl)}
          title={`Vidéo : ${title}`}
          className="absolute inset-0 size-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <HugeiconsIcon
            icon={
              state.tone === "pending"
                ? Loading03Icon
                : state.tone === "error"
                  ? Alert02Icon
                  : VideoOffIcon
            }
            className={cn(
              "size-7",
              state.tone === "error" ? "text-red-400" : "text-zinc-400",
              state.tone === "pending" && "animate-spin",
            )}
            size={28}
            strokeWidth={1.5}
          />
          <p className="text-sm font-semibold">
            {state.tone === "pending"
              ? "Vidéo en cours de traitement"
              : state.tone === "error"
                ? "Vidéo indisponible"
                : "Cette leçon n’a pas de vidéo"}
          </p>
          <p className="max-w-sm text-xs leading-5 text-zinc-400">
            {state.tone === "pending"
              ? "Bunny encode encore le fichier. Elle doit être prête avant toute publication."
              : state.tone === "error"
                ? "Le fichier a échoué à l’encodage ou a été supprimé de la médiathèque du formateur."
                : "Le contenu de la leçon passe par sa description et ses ressources."}
          </p>
        </div>
      )}
    </div>
  );
}

/** La position de lecture memorisee par Bunny n'a pas de sens pour un relecteur. */
function embedSource(embedUrl: string) {
  try {
    const url = new URL(embedUrl);
    url.searchParams.set("rememberPosition", "false");
    url.searchParams.set("autoplay", "false");
    return url.toString();
  } catch {
    return embedUrl;
  }
}

/** Valeur avant ou apres une modification de la fiche. */
export function ValueBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2",
        highlight ? "border-primary/30 bg-primary/5" : "border-border/60 bg-muted/30",
      )}
    >
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="max-h-40 overflow-y-auto whitespace-pre-line break-words text-sm">
        {value ? value : <span className="italic text-muted-foreground">Vide</span>}
      </p>
    </div>
  );
}

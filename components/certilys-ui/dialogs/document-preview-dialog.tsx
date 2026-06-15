"use client";

import { Download01Icon, File01Icon, FileUnknownIcon, Image01Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AppDialog } from "./app-dialog";

export interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  documentType?: string;
  url?: string | null;
  mimeType?: string | null;
}

function getKind(fileName: string, mimeType?: string | null) {
  const value = `${mimeType ?? ""} ${fileName}`.toLowerCase();
  if (value.includes("pdf") || value.endsWith(".pdf")) return "pdf";
  if (value.includes("image") || /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName)) return "image";
  return "other";
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  fileName,
  documentType = "Document",
  url,
  mimeType,
}: DocumentPreviewDialogProps) {
  const kind = getKind(fileName, mimeType);
  const canOpen = Boolean(url);

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={<span className="block truncate pr-8">Prévisualisation : {fileName}</span>}
      description={documentType}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Fermer
          </Button>
          <Button variant="outline" asChild disabled={!canOpen} className="w-full sm:w-auto">
            <a href={url ?? "#"} target="_blank" rel="noreferrer">
              <HugeiconsIcon icon={LinkSquare02Icon} className="mr-2 size-4" size={16} strokeWidth={1.5} />
              Nouvel onglet
            </a>
          </Button>
          <Button asChild disabled={!canOpen} className="w-full sm:w-auto">
            <a href={url ?? "#"} download={fileName}>
              <HugeiconsIcon icon={Download01Icon} className="mr-2 size-4" size={16} strokeWidth={1.5} />
              Télécharger
            </a>
          </Button>
        </div>
      }
    >
      <div className="min-w-0 space-y-4">
        {url ? (
          <p className="truncate rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground" title={url}>
            {url}
          </p>
        ) : null}
        <div className="flex min-h-[18rem] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/20 p-4">
          {kind === "image" && url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={fileName} className="max-h-[60dvh] max-w-full rounded-xl object-contain" />
          ) : kind === "pdf" && url ? (
            <iframe
              title={`Prévisualisation ${fileName}`}
              src={url}
              className="h-[60dvh] min-h-[24rem] w-full rounded-xl border-0 bg-white"
            />
          ) : kind === "pdf" ? (
            <div className="flex max-w-md flex-col items-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HugeiconsIcon icon={File01Icon} size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Document PDF indisponible</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Le lien temporaire n&apos;a pas pu être préparé. Fermez puis rouvrez cette prévisualisation.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex max-w-md flex-col items-center gap-3 text-center">
              <div className={cn("flex size-14 items-center justify-center rounded-2xl", kind === "image" ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground")}>
                <HugeiconsIcon icon={kind === "image" ? Image01Icon : FileUnknownIcon} size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Fichier non prévisualisable</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ouvrez le fichier dans un nouvel onglet ou téléchargez-le pour le consulter.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppDialog>
  );
}

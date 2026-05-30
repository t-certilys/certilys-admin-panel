"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AppDialogSize = "sm" | "md" | "lg" | "xl";

const widthBySize: Record<AppDialogSize, string> = {
  sm: "28rem",
  md: "36rem",
  lg: "46rem",
  xl: "60rem",
};

export interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  size?: AppDialogSize;
  className?: string;
  bodyClassName?: string;
  showCloseButton?: boolean;
}

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  header,
  footer,
  children,
  size = "md",
  className,
  bodyClassName,
  showCloseButton = true,
}: AppDialogProps) {
  const renderedHeader =
    header ??
    (title || description ? (
      <DialogHeader className="pr-8 text-left">
        {title ? (
          <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
            {title}
          </DialogTitle>
        ) : null}
        {description ? (
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            {description}
          </DialogDescription>
        ) : null}
      </DialogHeader>
    ) : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ "--dialog-width": widthBySize[size] } as React.CSSProperties}
        showCloseButton={showCloseButton}
        className={cn(
          "w-[calc(100vw-1rem)] sm:w-[min(calc(100vw-2rem),var(--dialog-width,36rem))] sm:max-w-none",
          "max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)]",
          "overflow-hidden rounded-2xl border border-border/60 bg-background p-0 shadow-none",
          className,
        )}
      >
        <div className="flex max-h-[inherit] min-h-0 flex-col">
          {renderedHeader ? (
            <div className="shrink-0 px-5 pt-5 sm:px-6 sm:pt-6">
              {renderedHeader}
            </div>
          ) : null}

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6",
              bodyClassName,
            )}
          >
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 px-5 pb-5 sm:px-6 sm:pb-6">
              {footer}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

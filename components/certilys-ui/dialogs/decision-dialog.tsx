"use client";

import * as React from "react";
import { Alert01Icon, AlertCircleIcon, Loading02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { AppDialog } from "./app-dialog";
import { ProfileSummary, type ProfileSummaryProps } from "./profile-summary";

export type DecisionTone = "default" | "danger" | "success" | "warning" | "info";

export interface DecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  tone?: DecisionTone;
  profile?: Omit<ProfileSummaryProps, "size">;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  minReasonLength?: number;
  confirmationValue?: string;
  confirmationLabel?: string;
  confirmationPlaceholder?: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: (payload: { reason: string }) => void | Promise<void>;
}

const toneClasses: Record<DecisionTone, string> = {
  default: "text-primary",
  danger: "text-destructive",
  success: "text-emerald-600",
  warning: "text-orange-600",
  info: "text-blue-600",
};

export function DecisionDialog({
  open,
  onOpenChange,
  title,
  description,
  tone = "default",
  profile,
  requireReason = false,
  reasonLabel = "Motif",
  reasonPlaceholder = "Précisez le motif…",
  minReasonLength = 10,
  confirmationValue,
  confirmationLabel = "Valeur de confirmation",
  confirmationPlaceholder = "Saisissez exactement la valeur demandée",
  confirmLabel,
  cancelLabel = "Annuler",
  loading = false,
  error,
  onConfirm,
}: DecisionDialogProps) {
  const [reason, setReason] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const trimmedReason = reason.trim();
  const invalidReason = requireReason && trimmedReason.length < minReasonLength;
  const requiresConfirmation = Boolean(confirmationValue);
  const invalidConfirmation =
    requiresConfirmation && confirmation !== confirmationValue;

  React.useEffect(() => {
    if (!open) {
      setReason("");
      setConfirmation("");
    }
  }, [open]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (loading) return;
      onOpenChange(nextOpen);
    },
    [loading, onOpenChange],
  );

  const handleConfirm = React.useCallback(() => {
    if (loading || invalidReason || invalidConfirmation) return;
    void onConfirm({ reason: trimmedReason });
  }, [
    invalidConfirmation,
    invalidReason,
    loading,
    onConfirm,
    trimmedReason,
  ]);

  const copyConfirmationValue = React.useCallback(() => {
    if (!confirmationValue || !navigator.clipboard) return;
    void navigator.clipboard.writeText(confirmationValue);
  }, [confirmationValue]);

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      size="lg"
      title={
        <span className="flex items-center gap-2 pr-8">
          <HugeiconsIcon
            icon={tone === "danger" ? Alert01Icon : AlertCircleIcon}
            className={cn("size-4 shrink-0", toneClasses[tone])}
            size={16}
            strokeWidth={1.5}
          />
          {title}
        </span>
      }
      description={description}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading || invalidReason || invalidConfirmation}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <HugeiconsIcon
                  icon={Loading02Icon}
                  className="mr-2 size-4 animate-spin"
                  size={16}
                  strokeWidth={1.5}
                />
                En cours…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {profile ? (
          <div className="rounded-xl bg-muted/30 p-4">
            <ProfileSummary {...profile} />
          </div>
        ) : null}

        {requiresConfirmation ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-foreground">
                Cette action est irréversible.
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Pour confirmer, saisissez exactement le nom ci-dessous. Les
                historiques financiers éventuellement associés seront
                conservés, mais le compte ne pourra plus être utilisé.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">
                À saisir pour confirmer :
              </p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 select-all overflow-x-auto rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground">
                  {confirmationValue}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyConfirmationValue}
                  disabled={loading}
                >
                  Copier
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="decision-confirmation"
                className="text-xs font-medium text-foreground"
              >
                {confirmationLabel}
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <Input
                id="decision-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={confirmationPlaceholder}
                disabled={loading}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={confirmation.length > 0 && invalidConfirmation}
              />
              {confirmation.length > 0 && invalidConfirmation ? (
                <p className="text-xs text-destructive" role="alert">
                  Le nom saisi ne correspond pas exactement au formateur à
                  supprimer.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {requireReason ? (
          <div className="space-y-2">
            <Label
              htmlFor="decision-reason"
              className="text-xs font-medium text-foreground"
            >
              {reasonLabel}
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Textarea
              id="decision-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={reasonPlaceholder}
              rows={4}
              disabled={loading}
              className="max-w-full resize-none text-sm"
            />
            {trimmedReason.length > 0 &&
            trimmedReason.length < minReasonLength ? (
              <p className="text-xs text-destructive">
                Minimum {minReasonLength} caractères requis (actuellement{" "}
                {trimmedReason.length}).
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="mt-0.5 size-4 shrink-0"
              size={16}
              strokeWidth={1.5}
            />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        ) : null}
      </div>
    </AppDialog>
  );
}

"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  AlertCircleIcon,
  Delete02Icon,
  Loading02Icon,
} from "@hugeicons/core-free-icons";

import { AppDialog } from "@/components/certilys-ui/dialogs/app-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  addCorrectionFormSchema,
  approvalFormSchema,
  REVIEW_ITEM_MAX_LENGTH,
  REVIEW_REASON_MAX_LENGTH,
  reviewDecisionFormSchema,
  type ReviewDecisionFormValues,
} from "@/lib/courses/course-review-decision.schema";
import {
  REVIEW_FIELDS_BY_TARGET,
  reviewFieldLabel,
  type ReviewCorrectionDraft,
} from "@/lib/courses/course-review.types";
import { cn } from "@/lib/utils";

export type ReviewDecision = "approve" | "request-changes" | "reject";

type Copy = {
  title: string;
  description: string;
  confirmLabel: string;
  reasonLabel: string;
  reasonPlaceholder: string;
};

const COPY: Record<"course" | "revision", Record<ReviewDecision, Copy>> = {
  course: {
    approve: {
      title: "Approuver la formation",
      description:
        "La formation est mise en ligne immédiatement : elle apparaît au catalogue et peut être achetée.",
      confirmLabel: "Approuver et mettre en ligne",
      reasonLabel: "Note pour le formateur (facultative)",
      reasonPlaceholder: "Un mot d’encouragement ou un conseil pour la suite…",
    },
    "request-changes": {
      title: "Demander des corrections",
      description:
        "Le formateur reçoit votre demande par notification et par e-mail, et retrouve chaque correction dans le studio, à côté de l’élément concerné.",
      confirmLabel: "Envoyer les corrections",
      reasonLabel: "Message global",
      reasonPlaceholder: "Résumez ce qui doit être repris avant validation…",
    },
    reject: {
      title: "Refuser la formation",
      description:
        "La formation est refusée. Le formateur est prévenu et peut la retravailler avant de la soumettre à nouveau.",
      confirmLabel: "Refuser la formation",
      reasonLabel: "Motif du refus",
      reasonPlaceholder: "Expliquez pourquoi la formation ne peut pas être publiée…",
    },
  },
  revision: {
    approve: {
      title: "Publier la mise à jour",
      description:
        "Le nouveau contenu remplace la version en ligne. La progression des apprenants déjà inscrits est conservée.",
      confirmLabel: "Publier la mise à jour",
      reasonLabel: "Note pour le formateur (facultative)",
      reasonPlaceholder: "Un mot pour le formateur…",
    },
    "request-changes": {
      title: "Demander des corrections",
      description:
        "La mise à jour retourne au formateur avec vos corrections. La version en ligne reste inchangée pendant ce temps.",
      confirmLabel: "Envoyer les corrections",
      reasonLabel: "Message global",
      reasonPlaceholder: "Résumez ce qui doit être repris avant publication…",
    },
    reject: {
      title: "Refuser la mise à jour",
      description:
        "La mise à jour est refusée et la version en ligne reste inchangée. Le formateur peut reprendre ses modifications depuis le studio.",
      confirmLabel: "Refuser la mise à jour",
      reasonLabel: "Motif du refus",
      reasonPlaceholder: "Expliquez pourquoi la mise à jour ne peut pas être publiée…",
    },
  },
};

export interface ReviewDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: ReviewDecision;
  scope: "course" | "revision";
  corrections: ReviewCorrectionDraft[];
  onCorrectionsChange: (next: ReviewCorrectionDraft[]) => void;
  onSubmit: (values: ReviewDecisionFormValues) => Promise<void>;
}

/**
 * Decision de l'administration sur un dossier. Les corrections preparees
 * pendant l'examen sont reprises, modifiables, et une remarque sur la fiche
 * peut encore etre ajoutee ici.
 *
 * Le dialogue est monte a chaque ouverture : il repart toujours du brouillon
 * de corrections courant, sans reinitialisation manuelle.
 */
export function ReviewDecisionDialog({
  open,
  onOpenChange,
  decision,
  scope,
  corrections,
  onCorrectionsChange,
  onSubmit,
}: ReviewDecisionDialogProps) {
  const copy = COPY[scope][decision];
  const isApproval = decision === "approve";
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<ReviewDecisionFormValues>({
    resolver: zodResolver(
      isApproval ? approvalFormSchema : reviewDecisionFormSchema,
    ),
    mode: "onChange",
    defaultValues: { reason: "", items: isApproval ? [] : corrections },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
    keyName: "fieldKey",
  });
  const items = useWatch({ control: form.control, name: "items" });
  const reason = useWatch({ control: form.control, name: "reason" });
  const { isSubmitting, isValid, errors } = form.formState;

  function syncDraft() {
    if (!isApproval) onCorrectionsChange(form.getValues("items"));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    if (!nextOpen) {
      if (
        reason.trim().length > 0 &&
        !window.confirm("Fermer sans envoyer votre décision ? Le message saisi sera perdu.")
      ) {
        return;
      }
      syncDraft();
    }
    onOpenChange(nextOpen);
  }

  async function submit(values: ReviewDecisionFormValues) {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      syncDraft();
      setServerError(
        error instanceof Error
          ? error.message
          : "La décision n’a pas pu être enregistrée. Réessayez dans un instant.",
      );
    }
  }

  const tone = decision === "reject" ? "danger" : isApproval ? "success" : "warning";

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      size={isApproval ? "md" : "lg"}
      title={copy.title}
      description={copy.description}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {isApproval
              ? null
              : items.length === 0
                ? "Aucune correction précise : le message global sera envoyé seul."
                : items.length === 1
                  ? "1 correction précise sera envoyée."
                  : `${items.length} corrections précises seront envoyées.`}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="review-decision-form"
              variant={tone === "danger" ? "destructive" : "default"}
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <HugeiconsIcon
                    icon={Loading02Icon}
                    className="size-4 animate-spin"
                    size={16}
                    strokeWidth={1.5}
                  />
                  Envoi en cours…
                </>
              ) : (
                copy.confirmLabel
              )}
            </Button>
          </div>
        </div>
      }
    >
      <form
        id="review-decision-form"
        className="space-y-5"
        onSubmit={form.handleSubmit(submit)}
        noValidate
      >
        <Field data-invalid={Boolean(errors.reason)}>
          <FieldLabel htmlFor="review-decision-reason">
            {copy.reasonLabel}
            {!isApproval && items.length === 0 ? (
              <span className="text-destructive">*</span>
            ) : null}
          </FieldLabel>
          <Textarea
            id="review-decision-reason"
            rows={isApproval ? 3 : 4}
            maxLength={REVIEW_REASON_MAX_LENGTH}
            placeholder={copy.reasonPlaceholder}
            className="resize-none text-sm"
            aria-invalid={Boolean(errors.reason)}
            disabled={isSubmitting}
            {...form.register("reason")}
          />
          <FieldError errors={[errors.reason]} />
        </Field>

        {isApproval ? null : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Corrections précises
              </h3>
              <Badge variant="outline" className="text-xs">
                {items.length}
              </Badge>
            </div>

            {fields.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-3 py-4 text-center text-xs leading-5 text-muted-foreground">
                Ajoutez des corrections depuis l’aperçu apprenant, sur chaque
                module ou leçon, ou ci-dessous pour la fiche de la formation.
              </p>
            ) : (
              <ul className="space-y-2">
                {fields.map((field, index) => {
                  const itemError = errors.items?.[index]?.message?.message;
                  return (
                    <li
                      key={field.fieldKey}
                      className="space-y-2 rounded-lg border border-border/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {field.label}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Retirer la correction « ${field.label} »`}
                          disabled={isSubmitting}
                          onClick={() => {
                            remove(index);
                            syncDraft();
                          }}
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            className="size-4"
                            size={16}
                            strokeWidth={1.5}
                          />
                        </Button>
                      </div>
                      <Textarea
                        rows={2}
                        maxLength={REVIEW_ITEM_MAX_LENGTH}
                        className="resize-none text-sm"
                        aria-label={`Correction pour ${field.label}`}
                        aria-invalid={Boolean(itemError)}
                        disabled={isSubmitting}
                        {...form.register(`items.${index}.message`)}
                      />
                      {itemError ? (
                        <p className="text-xs text-destructive" role="alert">
                          {itemError}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}

            <CourseCorrectionAdder
              disabled={isSubmitting || items.length >= 100}
              onAdd={(item) => {
                append(item);
                syncDraft();
              }}
            />
          </div>
        )}

        {serverError ? (
          <div
            className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="mt-0.5 size-4 shrink-0"
              size={16}
              strokeWidth={1.5}
            />
            <span className="min-w-0 break-words">{serverError}</span>
          </div>
        ) : null}
      </form>
    </AppDialog>
  );
}

/** Ajout d'une correction sur la fiche de la formation (titre, prix…). */
function CourseCorrectionAdder({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (item: ReviewCorrectionDraft) => void;
}) {
  const [field, setField] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState(false);

  if (!expanded) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setExpanded(true)}
      >
        <HugeiconsIcon icon={Add01Icon} className="size-4" size={16} strokeWidth={1.5} />
        Correction sur la fiche
      </Button>
    );
  }

  function add() {
    const parsed = addCorrectionFormSchema.safeParse({ field, message });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "La correction est invalide.");
      return;
    }
    onAdd({
      key:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
      targetType: "COURSE",
      field: parsed.data.field || undefined,
      label: reviewFieldLabel(parsed.data.field) ?? "Fiche de la formation",
      message: parsed.data.message,
    });
    setField("");
    setMessage("");
    setError(null);
    setExpanded(false);
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
      <NativeSelect
        value={field}
        onChange={(event) => setField(event.target.value)}
        aria-label="Élément de la fiche concerné"
        className="w-full"
      >
        <NativeSelectOption value="">Fiche de la formation</NativeSelectOption>
        {REVIEW_FIELDS_BY_TARGET.COURSE.map((option) => (
          <NativeSelectOption key={option} value={option}>
            {reviewFieldLabel(option)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Textarea
        rows={2}
        value={message}
        maxLength={REVIEW_ITEM_MAX_LENGTH}
        onChange={(event) => {
          setMessage(event.target.value);
          if (error) setError(null);
        }}
        placeholder="Décrivez la correction attendue…"
        aria-label="Correction sur la fiche"
        aria-invalid={Boolean(error)}
        className={cn("resize-none text-sm")}
      />
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setExpanded(false);
            setError(null);
          }}
        >
          Annuler
        </Button>
        <Button type="button" size="sm" onClick={add} disabled={disabled}>
          Ajouter
        </Button>
      </div>
    </div>
  );
}

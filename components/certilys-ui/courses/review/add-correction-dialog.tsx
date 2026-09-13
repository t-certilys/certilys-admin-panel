"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AppDialog } from "@/components/certilys-ui/dialogs/app-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  addCorrectionFormSchema,
  REVIEW_ITEM_MAX_LENGTH,
  type AddCorrectionFormValues,
} from "@/lib/courses/course-review-decision.schema";
import {
  REVIEW_FIELDS_BY_TARGET,
  reviewFieldLabel,
  type ReviewCorrectionDraft,
} from "@/lib/courses/course-review.types";

export type CorrectionTarget = {
  type: "MODULE" | "LESSON";
  id: string;
  /** Par exemple « Leçon 2.3 · Déployer ». */
  label: string;
  /** Champ propose par defaut, par exemple la video qui vient de changer. */
  suggestedField?: string;
};

interface AddCorrectionDialogProps {
  target: CorrectionTarget | null;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: Omit<ReviewCorrectionDraft, "key">) => void;
}

/** Note une correction sur un module ou une leçon pendant l'examen. */
export function AddCorrectionDialog({
  target,
  onOpenChange,
  onAdd,
}: AddCorrectionDialogProps) {
  const form = useForm<AddCorrectionFormValues>({
    resolver: zodResolver(addCorrectionFormSchema),
    mode: "onChange",
    defaultValues: { field: "", message: "" },
  });
  const { errors, isValid, isDirty } = form.formState;

  const { reset } = form;
  React.useEffect(() => {
    if (target) reset({ field: target.suggestedField ?? "", message: "" });
  }, [target, reset]);

  if (!target) return null;
  const options = REVIEW_FIELDS_BY_TARGET[target.type];
  const wholeLabel =
    target.type === "LESSON" ? "Leçon entière" : "Module entier";

  function close() {
    if (
      isDirty &&
      form.getValues("message").trim() &&
      !window.confirm("Fermer sans ajouter cette correction ?")
    ) {
      return;
    }
    onOpenChange(false);
  }

  function submit(values: AddCorrectionFormValues) {
    if (!target) return;
    const fieldLabel = reviewFieldLabel(values.field);
    onAdd({
      targetType: target.type,
      targetId: target.id,
      field: values.field || undefined,
      label: fieldLabel ? `${target.label} · ${fieldLabel}` : target.label,
      message: values.message,
    });
    onOpenChange(false);
  }

  return (
    <AppDialog
      open
      onOpenChange={(open) => (open ? undefined : close())}
      size="md"
      title="Ajouter une correction"
      description={`${target.label}. La correction est ajoutée à votre décision, envoyée au formateur quand vous demandez des corrections ou refusez.`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={close}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="add-correction-form"
            disabled={!isValid}
          >
            Ajouter la correction
          </Button>
        </div>
      }
    >
      <form
        id="add-correction-form"
        className="space-y-4"
        onSubmit={form.handleSubmit(submit)}
        noValidate
      >
        <Field>
          <FieldLabel htmlFor="add-correction-field">Élément concerné</FieldLabel>
          <NativeSelect
            id="add-correction-field"
            className="w-full"
            {...form.register("field")}
          >
            <NativeSelectOption value="">{wholeLabel}</NativeSelectOption>
            {options.map((option) => (
              <NativeSelectOption key={option} value={option}>
                {reviewFieldLabel(option)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field data-invalid={Boolean(errors.message)}>
          <FieldLabel htmlFor="add-correction-message">
            Correction attendue<span className="text-destructive">*</span>
          </FieldLabel>
          <Textarea
            id="add-correction-message"
            rows={4}
            autoFocus
            maxLength={REVIEW_ITEM_MAX_LENGTH}
            placeholder="Par exemple : le son est trop faible à partir de 2 min 30."
            className="resize-none text-sm"
            aria-invalid={Boolean(errors.message)}
            {...form.register("message")}
          />
          <FieldError errors={[errors.message]} />
        </Field>
      </form>
    </AppDialog>
  );
}

"use client";

import * as React from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cropImageToWebp } from "@/lib/images/crop-image";

type ImageCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
};

export function ImageCropDialog({
  open,
  imageSrc,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Enregistrer le cadrage",
}: ImageCropDialogProps) {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [cropPixels, setCropPixels] = React.useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function resetEditor() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCropPixels(null);
    setError(null);
  }

  function closeDialog() {
    resetEditor();
    onOpenChange(false);
  }

  async function confirm() {
    if (!imageSrc || !cropPixels || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await cropImageToWebp(imageSrc, cropPixels, rotation, 1024);
      await onConfirm(blob);
      closeDialog();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "La photo n’a pas pu être préparée.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isProcessing && !nextOpen) closeDialog();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative h-[min(58dvh,28rem)] min-h-72 overflow-hidden rounded-xl bg-secondary">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_area, pixels) => setCropPixels(pixels)}
            />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <RangeField
            id="landing-photo-zoom"
            label="Zoom"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={setZoom}
          />
          <RangeField
            id="landing-photo-rotation"
            label="Rotation"
            min={-180}
            max={180}
            step={1}
            value={rotation}
            onChange={setRotation}
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={() => void confirm()}
            disabled={!cropPixels || isProcessing}
          >
            {isProcessing ? "Préparation..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RangeField({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-primary"
      />
    </label>
  );
}

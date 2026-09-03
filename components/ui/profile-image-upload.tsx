"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon } from "@hugeicons/core-free-icons";

import { ImageCropDialog } from "@/components/certilys-ui/image-crop-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_TYPES,
  imageUploadSchema,
} from "@/lib/images/image-upload.schema";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
  value?: string;
  file?: File | null;
  onChange: (file: File) => void;
  onReset?: () => void;
  fallbackText?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export const PROFILE_IMAGE_ALLOWED_TYPES = IMAGE_UPLOAD_TYPES;
export const PROFILE_IMAGE_MAX_BYTES = IMAGE_UPLOAD_MAX_BYTES;

const sizeMap = {
  sm: "size-16",
  md: "size-24",
  lg: "size-32",
};

export function ProfileImageUpload({
  value,
  file,
  onChange,
  onReset,
  fallbackText = "MD",
  size = "md",
  disabled = false,
  className,
}: ProfileImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>();
  const [cropSource, setCropSource] = React.useState<{
    url: string;
    name: string;
  } | null>(null);

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  React.useEffect(() => {
    return () => {
      if (cropSource) URL.revokeObjectURL(cropSource.url);
    };
  }, [cropSource]);

  const handleAvatarClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const processFile = (nextFile: File) => {
    const validation = imageUploadSchema.safeParse(nextFile);
    if (!validation.success) {
      setFileError(
        validation.error.issues[0]?.message ?? "La photo n’est pas valide.",
      );
      return;
    }

    setFileError(null);
    setCropSource({
      url: URL.createObjectURL(nextFile),
      name: nextFile.name,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (nextFile) {
      processFile(nextFile);
    }
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) {
      processFile(nextFile);
    }
  };

  const handleReset = () => {
    setFileError(null);
    onReset?.();
  };

  const displayedImage = previewUrl || value;

  return (
    <div
      className={cn("flex flex-col sm:flex-row items-center gap-6", className)}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAvatarClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleAvatarClick();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Choisir une nouvelle photo de profil"
        aria-disabled={disabled}
        className={cn(
          "relative group cursor-pointer rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragging && "ring-4 ring-primary/40 scale-105",
          disabled && "cursor-not-allowed opacity-80",
        )}
      >
        <Avatar
          className={cn(sizeMap[size], "border-2 border-background shadow-sm")}
        >
          <AvatarImage src={displayedImage} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {fallbackText
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        {!disabled && (
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center">
            <HugeiconsIcon
              icon={Camera01Icon}
              className="text-white"
              size={24}
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={PROFILE_IMAGE_ALLOWED_TYPES.join(",")}
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled}
        aria-invalid={Boolean(fileError)}
        aria-describedby="profile-image-help profile-image-error"
      />

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAvatarClick}
            disabled={disabled}
          >
            Modifier la photo
          </Button>
          {(displayedImage || file) && onReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleReset}
              disabled={disabled}
            >
              Supprimer
            </Button>
          )}
        </div>
        <p id="profile-image-help" className="text-xs text-muted-foreground">
          JPEG, PNG ou WebP. Taille maximale : 5 Mo.
        </p>
        <p
          id="profile-image-error"
          role="alert"
          aria-live="polite"
          className={cn("text-xs text-destructive", !fileError && "sr-only")}
        >
          {fileError || "Aucune erreur de fichier."}
        </p>
      </div>

      <ImageCropDialog
        open={Boolean(cropSource)}
        imageSrc={cropSource?.url ?? null}
        title="Ajuster la photo de profil"
        description="Déplacez la photo dans le cercle et ajustez le zoom avant de confirmer."
        confirmLabel="Utiliser cette photo"
        onOpenChange={(open) => {
          if (!open) setCropSource(null);
        }}
        onConfirm={(blob) => {
          const baseName = cropSource?.name.replace(/\.[^.]+$/, "") || "avatar";
          onChange(
            new File([blob], `${baseName}.webp`, { type: "image/webp" }),
          );
        }}
      />
    </div>
  );
}

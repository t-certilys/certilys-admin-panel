"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
  value?: string;                      // URL ou base64 de l'image actuelle
  onChange: (value: string) => void;   // Appelé avec la nouvelle image en base64
  onReset?: () => void;                // Appelé pour réinitialiser/supprimer la photo
  fallbackText?: string;               // Initiales affichées si pas de photo
  size?: "sm" | "md" | "lg";           // Taille de l'avatar (défaut: "md")
  disabled?: boolean;                  // Désactiver toute interaction
  className?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 1;

const sizeMap = {
  sm: "size-16",
  md: "size-24",
  lg: "size-32",
};

export function ProfileImageUpload({
  value,
  onChange,
  onReset,
  fallbackText = "MD",
  size = "md",
  disabled = false,
  className,
}: ProfileImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleAvatarClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPEG, PNG ou WebP.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 1 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-6", className)}>
      {/* Zone drag & drop + avatar cliquable */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAvatarClick}
        className={cn(
          "relative group cursor-pointer rounded-full transition-all duration-200",
          isDragging && "border-4 border-primary scale-105",
          disabled && "cursor-not-allowed opacity-80"
        )}
      >
        <Avatar className={cn(sizeMap[size], "border-2 border-background shadow-sm")}>
          <AvatarImage src={value} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {fallbackText.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        {/* Overlay caméra */}
        {!disabled && (
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <HugeiconsIcon icon={Camera01Icon} className="text-white" size={24} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Contrôles textuels */}
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
          {value && onReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onReset}
              disabled={disabled}
            >
              Supprimer
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground italic">
          JPEG, PNG ou WebP. Taille maximale : 1 Mo.
        </p>
      </div>
    </div>
  );
}

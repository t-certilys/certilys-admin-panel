import { z } from "zod";

export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const imageUploadSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Sélectionnez une photo à importer.",
  )
  .refine(
    (file) => (IMAGE_UPLOAD_TYPES as readonly string[]).includes(file.type),
    {
      message: "Choisissez une image JPEG, PNG ou WebP.",
    },
  )
  .refine((file) => file.size > 0, {
    message: "Le fichier sélectionné est vide.",
  })
  .refine((file) => file.size <= IMAGE_UPLOAD_MAX_BYTES, {
    message: "La photo ne doit pas dépasser 5 Mo.",
  });

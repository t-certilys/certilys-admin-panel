import { NextResponse } from "next/server";

import { AdminApiError, adminPatchUpload } from "@/lib/admin-api";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_AVATAR_BYTES + 64 * 1024;

export async function PATCH(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
      return NextResponse.json(
        {
          code: "AVATAR_FILE_TOO_LARGE",
          message: "La photo dépasse la taille maximale autorisée de 5 Mo.",
        },
        { status: 413 },
      );
    }

    const incoming = await request.formData();
    const avatar = incoming.get("avatar");

    if (!(avatar instanceof File)) {
      return NextResponse.json(
        {
          code: "AVATAR_FILE_REQUIRED",
          message: "Sélectionnez une photo de profil à envoyer.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(avatar.type)) {
      return NextResponse.json(
        {
          code: "AVATAR_FILE_TYPE_INVALID",
          message: "La photo doit être au format JPEG, PNG ou WebP.",
        },
        { status: 400 },
      );
    }

    if (avatar.size === 0 || avatar.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        {
          code: "AVATAR_FILE_TOO_LARGE",
          message: "La photo doit être une image valide de 5 Mo maximum.",
        },
        { status: avatar.size > MAX_AVATAR_BYTES ? 413 : 400 },
      );
    }

    const forwarded = new FormData();
    forwarded.append("avatar", avatar, avatar.name || "avatar");

    const user = await adminPatchUpload<Record<string, unknown>>(
      "/admin/auth/me/avatar",
      forwarded,
    );

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json(
        {
          code: error.code,
          message:
            error.status === 413
              ? "La photo dépasse la taille maximale autorisée de 5 Mo."
              : error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        code: "AVATAR_UPLOAD_FAILED",
        message: "Impossible d’envoyer la photo de profil.",
      },
      { status: 500 },
    );
  }
}

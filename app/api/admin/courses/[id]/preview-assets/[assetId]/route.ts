import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const BACKEND_URL =
  process.env.CERTILYS_BACKEND_URL ?? "http://localhost:4000";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type AssetDownloadResponse = { url: string; expiresAt: string | null };

/**
 * Ouvre une ressource de l'apercu administrateur. Le backend verifie la
 * session admin et renvoie une adresse signee de quelques minutes : un lien
 * direct dans la page serait deja expire au moment du clic.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; assetId: string }> },
) {
  const { id, assetId } = await context.params;
  const version =
    request.nextUrl.searchParams.get("version") === "revision"
      ? "revision"
      : "live";

  if (!UUID_PATTERN.test(id) || !assetId || assetId.length > 160) {
    return NextResponse.json(
      { message: "Ressource introuvable." },
      { status: 404 },
    );
  }

  const response = await fetch(
    `${BACKEND_URL}/admin/courses/${encodeURIComponent(id)}/preview/assets/${encodeURIComponent(assetId)}/download?version=${version}`,
    {
      method: "GET",
      headers: { Cookie: await currentCookieHeader() },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      {
        message:
          response.status === 404
            ? "Ressource introuvable."
            : "La ressource n’a pas pu être ouverte. Réessayez dans un instant.",
      },
      { status: response.status },
    );
  }

  const access = (await response.json()) as AssetDownloadResponse;
  let target: URL;
  try {
    target = new URL(access.url);
  } catch {
    return NextResponse.json(
      { message: "La ressource n’a pas pu être ouverte." },
      { status: 502 },
    );
  }
  if (target.protocol !== "https:" && target.hostname !== "localhost") {
    return NextResponse.json(
      { message: "La ressource n’a pas pu être ouverte." },
      { status: 502 },
    );
  }

  const redirect = NextResponse.redirect(target, 302);
  redirect.headers.set("Cache-Control", "private, no-store");
  return redirect;
}

async function currentCookieHeader() {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

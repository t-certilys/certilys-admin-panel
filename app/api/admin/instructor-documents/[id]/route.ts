import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const BACKEND_URL =
  process.env.CERTILYS_BACKEND_URL ?? "http://localhost:4000";

type DocumentAccessResponse = {
  document: {
    url: string;
    fileMimeType: string;
    type: string;
    fileSize: number;
    expiresInSeconds: number;
  };
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const kind = request.nextUrl.searchParams.get("kind") ?? "IDENTITY_DOCUMENT";
  const allowedKinds = new Set([
    "IDENTITY_DOCUMENT",
    "ESTABLISHMENT_DECLARATION",
    "COMPANY_IFU",
    "TRADE_REGISTER",
  ]);
  if (!allowedKinds.has(kind)) {
    return NextResponse.json(
      { message: "Le type de document est invalide." },
      { status: 400 },
    );
  }
  const cookieHeader = await currentCookieHeader();

  const accessResponse = await fetch(
    `${BACKEND_URL}/admin/instructor-applications/${encodeURIComponent(
      id,
    )}/documents/${encodeURIComponent(kind)}/url`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  if (!accessResponse.ok) {
    return NextResponse.json(
      { message: "Document indisponible." },
      { status: accessResponse.status },
    );
  }

  const access = (await accessResponse.json()) as DocumentAccessResponse;
  const documentResponse = await fetch(access.document.url, {
    method: "GET",
    cache: "no-store",
  });

  if (!documentResponse.ok) {
    return NextResponse.json(
      { message: "Impossible de charger le document." },
      { status: documentResponse.status },
    );
  }

  const body = await documentResponse.arrayBuffer();
  const contentType =
    documentResponse.headers.get("content-type") ||
    access.document.fileMimeType ||
    "application/octet-stream";
  const fileName = fileNameFromUrl(access.document.url);

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

async function currentCookieHeader() {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

function fileNameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const fileName = decodeURIComponent(
      parsed.pathname.split("/").filter(Boolean).pop() || "",
    );
    return sanitizeFileName(fileName || "document-identite");
  } catch {
    return "document-identite";
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/["\r\n\\/]/g, "_");
}

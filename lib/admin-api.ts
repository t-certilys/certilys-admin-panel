import "server-only";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.CERTILYS_BACKEND_URL ?? "http://localhost:4000";

type ApiErrorBody = {
  message?: string | string[];
  code?: string;
};

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

export async function adminGet<T>(
  path: string,
  options: { storeCookies?: boolean } = {},
): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "GET",
    headers: {
      Cookie: await currentCookieHeader(),
    },
    cache: "no-store",
  });
  if (options.storeCookies) {
    await storeResponseCookies(response);
  }
  return parseResponse<T>(response);
}

export async function adminMutation<T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  return adminJsonMutation<T>("POST", path, body);
}

export async function adminPatch<T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  return adminJsonMutation<T>("PATCH", path, body);
}

export async function adminDelete<T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  return adminJsonMutation<T>("DELETE", path, body);
}

export async function adminPut<T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  return adminJsonMutation<T>("PUT", path, body);
}

export async function adminUpload<T>(path: string, body: FormData): Promise<T> {
  return adminFormMutation<T>("POST", path, body);
}

export async function adminPatchUpload<T>(
  path: string,
  body: FormData,
): Promise<T> {
  return adminFormMutation<T>("PATCH", path, body);
}

async function adminFormMutation<T>(
  method: "POST" | "PATCH",
  path: string,
  body: FormData,
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const csrf = await getCsrf(attempt > 0);
    const cookieHeader = mergeCookieHeader(
      await currentCookieHeader(),
      csrf.setCookieHeaders,
    );
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: {
        "X-CSRF-Token": csrf.token,
        Cookie: cookieHeader,
      },
      body,
      cache: "no-store",
    });
    await storeResponseCookies(response);

    try {
      return await parseResponse<T>(response);
    } catch (error) {
      if (
        attempt === 0 &&
        error instanceof AdminApiError &&
        error.status === 403 &&
        error.code === "CSRF_INVALID"
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new AdminApiError("Token CSRF absent ou invalide.", 403, "CSRF_INVALID");
}

async function adminJsonMutation<T>(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const csrf = await getCsrf(attempt > 0);
    const cookieHeader = mergeCookieHeader(
      await currentCookieHeader(),
      csrf.setCookieHeaders,
    );
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf.token,
        Cookie: cookieHeader,
      },
      body: body ? JSON.stringify(body) : "{}",
      cache: "no-store",
    });
    await storeResponseCookies(response);

    try {
      return await parseResponse<T>(response);
    } catch (error) {
      if (
        attempt === 0 &&
        error instanceof AdminApiError &&
        error.status === 403 &&
        error.code === "CSRF_INVALID"
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new AdminApiError("Token CSRF absent ou invalide.", 403, "CSRF_INVALID");
}

async function getCsrf(forceRefresh = false) {
  const endpoint = forceRefresh
    ? "/auth/csrf?scope=admin&refresh=true"
    : "/auth/csrf?scope=admin";
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Cookie: await currentCookieHeader(),
    },
    cache: "no-store",
  });
  const setCookieHeaders = getSetCookieHeaders(response.headers);
  await storeResponseCookies(response);
  const body = (await response.json()) as { csrfToken: string };
  return { token: body.csrfToken, setCookieHeaders };
}

export async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: ApiErrorBody | T;
  try {
    body = text ? (JSON.parse(text) as ApiErrorBody | T) : ({} as T);
  } catch {
    throw new AdminApiError(
      response.status === 413
        ? "La photo dépasse la taille maximale autorisée de 5 Mo."
        : "Le serveur a renvoyé une réponse invalide.",
      response.status,
    );
  }

  if (response.ok) {
    return body as T;
  }

  const errorBody = body as ApiErrorBody;
  const message = Array.isArray(errorBody.message)
    ? errorBody.message[0]
    : errorBody.message;
  throw new AdminApiError(
    message ||
      (response.status === 413
        ? "La photo dépasse la taille maximale autorisée de 5 Mo."
        : "Une erreur est survenue."),
    response.status,
    errorBody.code,
  );
}

async function currentCookieHeader() {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

async function storeResponseCookies(response: Response) {
  const setCookies = getSetCookieHeaders(response.headers);
  if (!setCookies.length) return;

  const cookieStore = await cookies();
  for (const header of setCookies) {
    const [pair] = header.split(";");
    const [name, ...valueParts] = pair.split("=");
    const value = valueParts.join("=");
    if (!name) continue;

    const maxAgeMatch = /Max-Age=(-?\d+)/i.exec(header);
    const expiresMatch = /Expires=([^;]+)/i.exec(header);
    const httpOnly = /;\s*HttpOnly/i.test(header);
    const secure = /;\s*Secure/i.test(header);
    const sameSiteMatch = /SameSite=(Strict|Lax|None)/i.exec(header);

    if (value === "" || maxAgeMatch?.[1] === "0") {
      cookieStore.delete(name);
      continue;
    }

    cookieStore.set(name, value, {
      httpOnly,
      secure,
      sameSite: sameSiteMatch?.[1]?.toLowerCase() as
        | "strict"
        | "lax"
        | "none"
        | undefined,
      expires: expiresMatch?.[1] ? new Date(expiresMatch[1]) : undefined,
      path: "/",
    });
  }
}

function getSetCookieHeaders(headers: Headers) {
  const withGetter = headers as Headers & { getSetCookie?: () => string[] };
  const values = withGetter.getSetCookie?.();
  if (values?.length) return values;

  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function mergeCookieHeader(
  currentHeader: string,
  setCookieHeaders: string[],
) {
  const cookies = new Map<string, string>();

  for (const cookie of currentHeader.split(";")) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");
    if (!rawName) continue;
    cookies.set(rawName, rawValueParts.join("="));
  }

  for (const header of setCookieHeaders) {
    const [pair] = header.split(";");
    const [rawName, ...rawValueParts] = pair.split("=");
    const name = rawName.trim();
    if (!name) continue;
    cookies.set(name, rawValueParts.join("="));
  }

  return Array.from(cookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

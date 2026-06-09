import "server-only";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.CERTILYS_BACKEND_URL ?? process.env.NEXT_PUBLIC_CERTILYS_BACKEND_URL ?? "http://localhost:4000";

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

export async function adminGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "GET",
    headers: {
      Cookie: await currentCookieHeader(),
    },
    cache: "no-store",
  });
  await storeResponseCookies(response);
  return parseResponse<T>(response);
}

export async function adminMutation<T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const csrf = await getCsrf();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf.token,
      Cookie: await currentCookieHeader(),
    },
    body: body ? JSON.stringify(body) : "{}",
    cache: "no-store",
  });
  await storeResponseCookies(response);
  return parseResponse<T>(response);
}

async function getCsrf() {
  const response = await fetch(`${BACKEND_URL}/auth/csrf`, {
    method: "GET",
    headers: {
      Cookie: await currentCookieHeader(),
    },
    cache: "no-store",
  });
  await storeResponseCookies(response);
  const body = (await response.json()) as { csrfToken: string };
  return { token: body.csrfToken };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? (JSON.parse(text) as ApiErrorBody | T) : ({} as T);
  if (response.ok) {
    return body as T;
  }

  const errorBody = body as ApiErrorBody;
  const message = Array.isArray(errorBody.message)
    ? errorBody.message[0]
    : errorBody.message;
  throw new AdminApiError(
    message || "Une erreur est survenue.",
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
      sameSite: sameSiteMatch?.[1]?.toLowerCase() as "strict" | "lax" | "none" | undefined,
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

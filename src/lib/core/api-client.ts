/**
 * Client-side API helper — attaches session auth automatically.
 * Uses in-memory bearer token (iframe-safe) with cookie fallback.
 */

let sessionToken: string | null = null;
let sessionInitPromise: Promise<void> | null = null;

async function ensureApiSession(): Promise<void> {
  if (sessionToken) return;

  if (!sessionInitPromise) {
    sessionInitPromise = fetch('/api/auth/session', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error ?? 'Failed to obtain API session'
          );
        }
        const body = (await res.json()) as {
          success?: boolean;
          data?: { secured?: boolean; sessionToken?: string };
        };
        if (body.data?.sessionToken) {
          sessionToken = body.data.sessionToken;
        }
      })
      .finally(() => {
        sessionInitPromise = null;
      });
  }
  await sessionInitPromise;
}

function authHeaders(): Record<string, string> {
  if (!sessionToken) return {};
  return { Authorization: `Bearer ${sessionToken}` };
}

export async function apiFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    await ensureApiSession();
  }

  const incoming =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : (init.headers as Record<string, string> | undefined) ?? {};

  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      ...authHeaders(),
      ...incoming,
    },
  });
}

export async function apiPostJson<T = unknown>(
  url: string,
  body: unknown
): Promise<T> {
  const res = await apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }
  return data;
}

export async function apiPostFormData(url: string, formData: FormData): Promise<Response> {
  return apiFetch(url, { method: 'POST', body: formData });
}

/** Bootstrap session on app load (before first mutating API call). */
export function bootstrapApiSession(): void {
  void ensureApiSession().catch(() => {
    // Retry on first mutating call
    sessionToken = null;
  });
}

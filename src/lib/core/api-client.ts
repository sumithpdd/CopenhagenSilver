/**
 * Client-side API helper — attaches session cookie automatically (same-origin).
 * Fetches /api/auth/session on first mutating call when API_SECRET is configured.
 */

let sessionInitialized = false;
let sessionInitPromise: Promise<void> | null = null;

async function ensureApiSession(): Promise<void> {
  if (sessionInitialized) return;
  if (!sessionInitPromise) {
    sessionInitPromise = fetch('/api/auth/session', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error ?? 'Failed to obtain API session'
          );
        }
        sessionInitialized = true;
      })
      .finally(() => {
        sessionInitPromise = null;
      });
  }
  await sessionInitPromise;
}

export async function apiFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    await ensureApiSession();
  }

  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.headers ?? {}),
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

/**
 * Client-side API helper — attaches session auth automatically.
 * Uses in-memory bearer token (iframe-safe) with cookie fallback.
 */

let sessionToken: string | null = null;
let sessionInitPromise: Promise<void> | null = null;
let apiSecured: boolean | null = null;

function isSessionTokenFresh(token: string): boolean {
  const expiresStr = token.split('.')[0];
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires)) return false;
  // 30s skew buffer
  return Date.now() < expires - 30_000;
}

function resetSessionState(): void {
  sessionToken = null;
  apiSecured = null;
  sessionInitPromise = null;
}

/** True for booth API session failures (API_SECRET flow), not Gemini/Firebase keys. */
export function isApiSessionError(message: string): boolean {
  return /API session|Could not obtain API session|Unauthorized.*session/i.test(
    message
  );
}

async function fetchApiSession(): Promise<void> {
  // POST — Vercel CDN was caching GET /api/auth/session and returning expired tokens
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store',
      Pragma: 'no-cache',
    },
    body: '{}',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? 'Failed to obtain API session'
    );
  }

  const body = (await res.json()) as {
    success?: boolean;
    data?: {
      secured?: boolean;
      sessionToken?: string;
      issuedAt?: number;
    };
  };

  apiSecured = body.data?.secured ?? false;

  if (body.data?.secured && !body.data.sessionToken) {
    throw new Error('API session response missing token');
  }

  if (body.data?.sessionToken) {
    sessionToken = body.data.sessionToken;
    if (!isSessionTokenFresh(body.data.sessionToken)) {
      console.warn(
        '[api-client] Session token from server is near expiry; mutating calls will refresh on 401'
      );
    }
  } else if (!body.data?.secured) {
    sessionToken = null;
  }
}

async function ensureApiSession(options?: { force?: boolean }): Promise<void> {
  const force = options?.force ?? false;

  if (!force && sessionToken && isSessionTokenFresh(sessionToken)) {
    return;
  }

  if (force) {
    sessionInitPromise = null;
  }

  if (!sessionInitPromise) {
    sessionInitPromise = fetchApiSession().finally(() => {
      sessionInitPromise = null;
    });
  }

  await sessionInitPromise;

  if (apiSecured && !sessionToken) {
    throw new Error('Could not obtain API session token');
  }
}

function authHeaders(): Record<string, string> {
  if (!sessionToken) return {};
  return { Authorization: `Bearer ${sessionToken}` };
}

function isMutatingMethod(method: string): boolean {
  return method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
}

export async function apiFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const mutating = isMutatingMethod(method);

  if (mutating) {
    await ensureApiSession();
  }

  const incoming =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : (init.headers as Record<string, string> | undefined) ?? {};

  const performFetch = () =>
    fetch(url, {
      ...init,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        ...incoming,
        ...authHeaders(),
      },
    });

  const response = await performFetch();

  // Stale session — refresh once and retry
  if (mutating && response.status === 401) {
    resetSessionState();
    await ensureApiSession({ force: true });
    return performFetch();
  }

  return response;
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
    resetSessionState();
  });
}

/** Force a new session token (e.g. right before composit/upload on processing page). */
export async function refreshApiSession(): Promise<void> {
  resetSessionState();
  await ensureApiSession({ force: true });
}

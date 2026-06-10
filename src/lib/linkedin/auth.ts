import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import {
  LINKEDIN_ACCESS_COOKIE,
  LINKEDIN_EXPIRES_COOKIE,
  LINKEDIN_OAUTH_STATE_COOKIE,
  LINKEDIN_PERSON_COOKIE,
  LINKEDIN_SCOPES,
} from '@/lib/linkedin/constants';

export function isLinkedInConfigured(): boolean {
  return Boolean(
    process.env.LINKEDIN_CLIENT_ID?.trim() &&
      process.env.LINKEDIN_CLIENT_SECRET?.trim()
  );
}

export function getLinkedInRedirectUri(): string {
  const explicit = process.env.LINKEDIN_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/api/linkedin/callback`;
}

export function buildLinkedInAuthUrl(state: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID!.trim();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: getLinkedInRedirectUri(),
    scope: LINKEDIN_SCOPES.join(' '),
    state,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export function createOAuthState(returnTo: string): string {
  const secret = process.env.API_SECRET?.trim() || process.env.LINKEDIN_CLIENT_SECRET!.trim();
  const nonce = randomBytes(16).toString('hex');
  const payload = `${returnTo}|${nonce}|${Date.now()}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

export function verifyOAuthState(state: string): { returnTo: string } | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 4) return null;
    const [returnTo, nonce, ts, sig] = parts;
    const secret = process.env.API_SECRET?.trim() || process.env.LINKEDIN_CLIENT_SECRET!.trim();
    const payload = `${returnTo}|${nonce}|${ts}`;
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (Date.now() - Number(ts) > 10 * 60 * 1000) return null;
    const safeReturn = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/result';
    return { returnTo: safeReturn };
  } catch {
    return null;
  }
}

export interface LinkedInSession {
  accessToken: string;
  personId: string;
  expiresAt: number;
}

export async function getLinkedInSession(): Promise<LinkedInSession | null> {
  const jar = await cookies();
  const accessToken = jar.get(LINKEDIN_ACCESS_COOKIE)?.value;
  const personId = jar.get(LINKEDIN_PERSON_COOKIE)?.value;
  const expiresAt = Number(jar.get(LINKEDIN_EXPIRES_COOKIE)?.value ?? 0);

  if (!accessToken || !personId) return null;
  if (expiresAt && Date.now() > expiresAt) return null;

  return { accessToken, personId, expiresAt };
}

export async function exchangeLinkedInCode(code: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const clientId = process.env.LINKEDIN_CLIENT_ID!.trim();
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!.trim();

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getLinkedInRedirectUri(),
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn token exchange failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  return { accessToken: json.access_token, expiresIn: json.expires_in };
}

export async function fetchLinkedInPersonId(accessToken: string): Promise<string> {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn userinfo failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { sub?: string };
  if (!json.sub) {
    throw new Error('LinkedIn userinfo missing member id');
  }

  return json.sub;
}

export function linkedInCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/**
 * Secure API access for mutating routes.
 *
 * When API_SECRET is set, POST/PATCH/DELETE routes require either:
 *   - Authorization: Bearer <API_SECRET>  (server-to-server)
 *   - booth_api_session cookie            (issued by GET /api/auth/session)
 *
 * When API_SECRET is unset, routes are open (event kiosk / local dev).
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';

export const BOOTH_SESSION_COOKIE = 'booth_api_session';
const SESSION_TTL_MS = 60 * 60 * 4; // 4 hours

function getApiSecret(): string | undefined {
  return process.env.API_SECRET?.trim() || undefined;
}

function extractToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) return apiKey.trim();
  return null;
}

function safeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/** Create a signed session token for client API calls. */
export function createSessionToken(secret: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `booth:${expires}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${expires}.${sig}`;
}

/** Verify a session token from the booth_api_session cookie. */
export function verifySessionToken(token: string, secret: string): boolean {
  const [expiresStr, sig] = token.split('.');
  if (!expiresStr || !sig) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expected = createHmac('sha256', secret)
    .update(`booth:${expires}`)
    .digest('hex');

  return safeEqual(sig, expected);
}

export type ApiAuthResult =
  | { authorized: true }
  | { authorized: false; response: NextResponse };

/** Verify session token string (cookie value or Authorization bearer). */
export function isValidSessionToken(token: string, secret: string): boolean {
  return verifySessionToken(token, secret);
}

/**
 * Guard mutating API routes. Returns unauthorized response when check fails.
 * Call at the top of POST/PATCH/DELETE handlers.
 */
export function requireApiAuth(request: NextRequest): ApiAuthResult {
  const secret = getApiSecret();

  // Open mode — kiosk / dev without API_SECRET
  if (!secret) {
    return { authorized: true };
  }

  const bearer = extractToken(request);
  if (bearer) {
    if (safeEqual(bearer, secret)) {
      return { authorized: true };
    }
    // Signed session token (works when third-party cookies are blocked in iframes)
    if (verifySessionToken(bearer, secret)) {
      return { authorized: true };
    }
  }

  const session = request.cookies.get(BOOTH_SESSION_COOKIE)?.value;
  if (session && verifySessionToken(session, secret)) {
    return { authorized: true };
  }

  // Admin staff session (gallery moderation + social share from /admin)
  if (verifyAdminRequest(request)) {
    return { authorized: true };
  }

  return {
    authorized: false,
    response: NextResponse.json(
      {
        success: false,
        error: 'Unauthorized — call GET /api/auth/session first or provide a valid API key',
      },
      { status: 401 }
    ),
  };
}

export function isApiSecretConfigured(): boolean {
  return Boolean(getApiSecret());
}

import { NextRequest, NextResponse } from 'next/server';
import {
  BOOTH_SESSION_COOKIE,
  createSessionToken,
  isApiSecretConfigured,
} from '@/lib/core/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
  // Prevent Vercel / CDN from caching session tokens (stale token → client "expired" error)
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

function issueSessionResponse(secret: string | undefined): NextResponse {
  if (!secret) {
    return NextResponse.json(
      {
        success: true,
        data: { secured: false, message: 'API_SECRET not configured — open mode' },
      },
      { headers: NO_STORE_HEADERS }
    );
  }

  const token = createSessionToken(secret);
  const response = NextResponse.json(
    {
      success: true,
      data: {
        secured: true,
        expiresInHours: 4,
        issuedAt: Date.now(),
        sessionToken: token,
      },
    },
    { headers: NO_STORE_HEADERS }
  );

  response.cookies.set(BOOTH_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // lax/none: Marketplace iframe is cross-site — strict blocks the cookie on POST
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 4,
  });

  return response;
}

/**
 * GET /api/auth/session — open mode check only; prefer POST (not CDN-cached on Vercel).
 */
export async function GET(_request: NextRequest) {
  return issueSessionResponse(process.env.API_SECRET?.trim());
}

/**
 * POST /api/auth/session
 * Issues a fresh session token. POST avoids Vercel edge cache serving stale GET responses.
 */
export async function POST(_request: NextRequest) {
  return issueSessionResponse(process.env.API_SECRET?.trim());
}

export async function HEAD() {
  return new NextResponse(null, {
    status: isApiSecretConfigured() ? 200 : 204,
  });
}

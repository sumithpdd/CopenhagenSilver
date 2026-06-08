import { NextRequest, NextResponse } from 'next/server';
import {
  BOOTH_SESSION_COOKIE,
  createSessionToken,
  isApiSecretConfigured,
} from '@/lib/core/api-auth';

/**
 * GET /api/auth/session
 * Issues an httpOnly session cookie for client-side API calls when API_SECRET is set.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.API_SECRET?.trim();

  if (!secret) {
    return NextResponse.json({
      success: true,
      data: { secured: false, message: 'API_SECRET not configured — open mode' },
    });
  }

  const token = createSessionToken(secret);
  const response = NextResponse.json({
    success: true,
    data: {
      secured: true,
      expiresInHours: 4,
      // Also return token for iframe contexts where third-party cookies are blocked
      sessionToken: token,
    },
  });

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

export async function HEAD() {
  return new NextResponse(null, {
    status: isApiSecretConfigured() ? 200 : 204,
  });
}

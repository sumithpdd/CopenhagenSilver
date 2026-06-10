import { NextRequest, NextResponse } from 'next/server';
import {
  buildLinkedInAuthUrl,
  createOAuthState,
  isLinkedInConfigured,
  linkedInCookieOptions,
} from '@/lib/linkedin/auth';
import { LINKEDIN_OAUTH_STATE_COOKIE } from '@/lib/linkedin/constants';

export const dynamic = 'force-dynamic';

/** GET /api/linkedin/auth — redirect to LinkedIn OAuth. */
export async function GET(request: NextRequest) {
  if (!isLinkedInConfigured()) {
    return NextResponse.json(
      { success: false, error: 'LinkedIn sharing not configured' },
      { status: 503 }
    );
  }

  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/result';
  const state = createOAuthState(returnTo);
  const response = NextResponse.redirect(buildLinkedInAuthUrl(state));

  response.cookies.set(
    LINKEDIN_OAUTH_STATE_COOKIE,
    state,
    linkedInCookieOptions(600)
  );

  return response;
}

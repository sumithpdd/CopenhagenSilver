import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeLinkedInCode,
  fetchLinkedInPersonId,
  isLinkedInConfigured,
  linkedInCookieOptions,
  verifyOAuthState,
} from '@/lib/linkedin/auth';
import {
  LINKEDIN_ACCESS_COOKIE,
  LINKEDIN_EXPIRES_COOKIE,
  LINKEDIN_OAUTH_STATE_COOKIE,
  LINKEDIN_PERSON_COOKIE,
} from '@/lib/linkedin/constants';

export const dynamic = 'force-dynamic';

/** GET /api/linkedin/callback — OAuth callback, sets session cookies. */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || request.nextUrl.origin;

  if (!isLinkedInConfigured()) {
    return NextResponse.redirect(`${baseUrl}/result?linkedin=error&reason=not_configured`);
  }

  const error = request.nextUrl.searchParams.get('error');
  if (error) {
    return NextResponse.redirect(`${baseUrl}/result?linkedin=error&reason=${encodeURIComponent(error)}`);
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const cookieState = request.cookies.get(LINKEDIN_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(`${baseUrl}/result?linkedin=error&reason=invalid_state`);
  }

  const verified = verifyOAuthState(state);
  if (!verified) {
    return NextResponse.redirect(`${baseUrl}/result?linkedin=error&reason=invalid_state`);
  }

  try {
    const { accessToken, expiresIn } = await exchangeLinkedInCode(code);
    const personId = await fetchLinkedInPersonId(accessToken);
    const expiresAt = Date.now() + expiresIn * 1000;

    const response = NextResponse.redirect(
      `${baseUrl}${verified.returnTo}?linkedin=connected`
    );

    response.cookies.set(
      LINKEDIN_ACCESS_COOKIE,
      accessToken,
      linkedInCookieOptions(expiresIn)
    );
    response.cookies.set(
      LINKEDIN_PERSON_COOKIE,
      personId,
      linkedInCookieOptions(expiresIn)
    );
    response.cookies.set(
      LINKEDIN_EXPIRES_COOKIE,
      String(expiresAt),
      linkedInCookieOptions(expiresIn)
    );
    response.cookies.delete(LINKEDIN_OAUTH_STATE_COOKIE);

    return response;
  } catch (err) {
    console.error('[linkedin/callback]', err);
    return NextResponse.redirect(`${baseUrl}/result?linkedin=error&reason=token_exchange`);
  }
}

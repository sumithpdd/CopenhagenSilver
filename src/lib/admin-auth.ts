import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'silver_admin_session';

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim();
}

/** Verify admin from cookie (set by /api/admin/login) or Authorization header. */
export function verifyAdminRequest(request: NextRequest): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;

  const cookieToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return cookieToken === secret;
}

export async function verifyAdminFromCookies(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === secret;
}

export function unauthorizedAdminResponse() {
  return Response.json(
    { success: false, error: 'Unauthorized — admin access required' },
    { status: 401 }
  );
}

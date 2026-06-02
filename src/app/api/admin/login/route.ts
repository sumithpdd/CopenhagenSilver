import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getAdminSecret } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'Admin not configured (set ADMIN_SECRET in env)' },
      { status: 503 }
    );
  }

  const body = await request.json();
  const password = String(body.password ?? '');

  if (password !== secret) {
    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}

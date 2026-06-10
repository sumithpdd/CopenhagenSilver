import { NextResponse } from 'next/server';
import {
  LINKEDIN_ACCESS_COOKIE,
  LINKEDIN_EXPIRES_COOKIE,
  LINKEDIN_PERSON_COOKIE,
} from '@/lib/linkedin/constants';

export const dynamic = 'force-dynamic';

/** POST /api/linkedin/disconnect */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(LINKEDIN_ACCESS_COOKIE);
  response.cookies.delete(LINKEDIN_PERSON_COOKIE);
  response.cookies.delete(LINKEDIN_EXPIRES_COOKIE);
  return response;
}

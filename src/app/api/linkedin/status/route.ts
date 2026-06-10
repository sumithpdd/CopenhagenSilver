import { NextResponse } from 'next/server';
import { getLinkedInSession, isLinkedInConfigured } from '@/lib/linkedin/auth';

export const dynamic = 'force-dynamic';

/** GET /api/linkedin/status */
export async function GET() {
  const configured = isLinkedInConfigured();
  const session = configured ? await getLinkedInSession() : null;

  return NextResponse.json({
    success: true,
    data: {
      configured,
      connected: Boolean(session),
    },
  });
}

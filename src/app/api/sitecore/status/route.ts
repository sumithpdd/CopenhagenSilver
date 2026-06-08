import { NextResponse } from 'next/server';
import { isSitecoreConfigured } from '@/lib/core/runtime-mode';

/**
 * GET /api/sitecore/status
 * Reports whether Sitecore Authoring API credentials are configured.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      configured: isSitecoreConfigured(),
      hasClientId: Boolean(process.env.SITECORE_CLIENT_ID),
      hasClientSecret: Boolean(process.env.SITECORE_CLIENT_SECRET),
      hasHost: Boolean(process.env.XMC_HOST),
    },
  });
}

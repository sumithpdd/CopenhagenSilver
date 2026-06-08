import { NextResponse } from 'next/server';
import { isSitecoreConfigured } from '@/lib/core/runtime-mode';
import {
  getAttendeesParentPath,
  isAttendeePageSyncConfigured,
  getAttendeeTemplateId,
} from '@/lib/sitecore/attendee-profile';
import {
  DEFAULT_ATTENDEE_TEMPLATE_PATH,
  getSitePath,
} from '@/lib/sitecore/constants';

/**
 * GET /api/sitecore/status
 * Reports whether Sitecore Authoring API credentials are configured.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      configured: isSitecoreConfigured(),
      attendeePageSync: isAttendeePageSyncConfigured(),
      hasClientId: Boolean(process.env.SITECORE_CLIENT_ID),
      hasClientSecret: Boolean(process.env.SITECORE_CLIENT_SECRET),
      hasHost: Boolean(process.env.XMC_HOST),
      hasAttendeeTemplateId: Boolean(getAttendeeTemplateId()),
      sitePath: getSitePath(),
      attendeesParentPath: getAttendeesParentPath(),
      attendeeTemplatePath: DEFAULT_ATTENDEE_TEMPLATE_PATH,
      attendeeTemplateId: getAttendeeTemplateId(),
      attendeeTemplateName: 'SitecoreSilverAttendeeProfile',
    },
  });
}

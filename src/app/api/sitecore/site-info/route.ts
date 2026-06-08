import { NextResponse } from 'next/server';
import { getSitecoreSiteInfo } from '@/lib/sitecore/site-info';
import {
  DEFAULT_ATTENDEE_TEMPLATE_PATH,
  getAttendeeTemplateId,
  getSitePath,
} from '@/lib/sitecore/constants';
import { getAttendeesParentPath } from '@/lib/sitecore/attendee-profile';

/**
 * GET /api/sitecore/site-info
 * Current Sitecore site name/path and SilverAttendees item count.
 */
export async function GET() {
  const info = await getSitecoreSiteInfo();

  return NextResponse.json({
    success: !info.error,
    data: {
      ...info,
      paths: {
        site: getSitePath(),
        attendeesFolder: getAttendeesParentPath(),
        attendeeTemplate: DEFAULT_ATTENDEE_TEMPLATE_PATH,
        attendeeTemplateId: getAttendeeTemplateId(),
      },
    },
    error: info.error,
  });
}

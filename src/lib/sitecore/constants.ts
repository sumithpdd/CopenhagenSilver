/** Sitecore Silver Celebration — CM content paths and template IDs. */

export const DEFAULT_SITE_PATH =
  '/sitecore/content/sitecoresilver/sitecoresilver';

export const DEFAULT_ATTENDEES_PARENT_PATH =
  '/sitecore/content/sitecoresilver/sitecoresilver/Home/SilverAttendees';

export const DEFAULT_ATTENDEE_TEMPLATE_ID =
  '{B574DCCF-0001-400D-8010-000000010112}';

export const DEFAULT_ATTENDEE_TEMPLATE_PATH =
  '/sitecore/templates/Project/sitecoresilver/SilverCelebration/SitecoreSilverAttendeeProfile/SitecoreSilverAttendeeProfile';

export function getSitePath(): string {
  return process.env.SITECORE_SITE_PATH?.trim() || DEFAULT_SITE_PATH;
}

export function getAttendeeTemplateId(): string {
  return (
    process.env.SITECORE_ATTENDEE_TEMPLATE_ID?.trim() ||
    DEFAULT_ATTENDEE_TEMPLATE_ID
  );
}

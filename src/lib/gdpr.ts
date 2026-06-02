/**
 * GDPR / privacy copy for Sitecore Silver Photo Booth (Copenhagen 2026).
 * Adapted from photo_booth_ai terms flow; event-specific wording.
 */

export const GDPR_SUMMARY =
  'By using this AI Photo Booth you agree to processing your photo with Google Gemini, ' +
  'temporary storage on Firebase, and the terms below. You may opt out of the public gallery ' +
  'while still receiving your personal keepsake.';

export const GDPR_SECTIONS = [
  {
    title: 'Photo processing',
    body:
      'We process your portrait with AI (Google Gemini) to apply your chosen background and creative prompt. ' +
      'Processing happens on secure servers; your API key and images are not exposed to other guests.',
  },
  {
    title: 'Storage & gallery',
    body:
      'Original and AI-enhanced images are stored in Firebase (EU/US per your Firebase project configuration) ' +
      'so you can download, print, and retrieve them by photo code. If you consent to the community gallery, ' +
      'your composited image may be visible to other event attendees. You can decline gallery sharing and ' +
      'your photo will not appear publicly.',
  },
  {
    title: 'Your rights (GDPR)',
    body:
      'You have the right to access, rectify, or request deletion of your photos. Contact the event desk or ' +
      'Sitecore Silver organizers. Photos that are inappropriate or non-consensual can be hidden or removed ' +
      'by administrators at any time.',
  },
  {
    title: 'Retention',
    body:
      'Event photos are retained for the anniversary celebration period and operational backup, then deleted ' +
      'according to Sitecore’s event data retention policy unless you request earlier deletion.',
  },
  {
    title: 'Code of conduct',
    body:
      'Use the booth responsibly. Do not submit offensive, violent, or non-consensual content. ' +
      'Administrators may hide or delete images that breach event standards.',
  },
] as const;

export const GDPR_CHECKBOX_TERMS =
  'I have read and agree to the Terms & Privacy Notice, including AI processing of my image.';

export const GDPR_CHECKBOX_GALLERY =
  'I agree my AI-enhanced photo may be shown in the public community gallery at the event.';

export const GDPR_FOOTER =
  'Photos are processed per our privacy notice. Request deletion at the event desk or via an administrator.';

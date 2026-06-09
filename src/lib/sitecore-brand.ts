/**
 * Official Sitecore Silver Celebration brand assets & AI prompt guardrails.
 * @see https://www.sitecore.com/resources/events-webinars/2026/05/sitecore-silver-celebration-copenhagen
 * @see https://www.sitecore.com/platform — SitecoreAI is one word
 */

const CONTENT_HUB = 'https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content';

export const SITECORE_OFFICIAL = {
  logoContentHub: `${CONTENT_HUB}/d027789fafe14af0ac8bf843e9a77c0b?v=4baa5a18`,
  logoLocal: '/branding/sitecore-silver-logo-official.png',
  backdropContentHub: `${CONTENT_HUB}/bb6c08c2c6104b258ae635f1372f6833?v=22afe237`,
  backdropLocal: '/branding/page-backdrop-official.jpg',
  eventPageUrl:
    'https://www.sitecore.com/resources/events-webinars/2026/05/sitecore-silver-celebration-copenhagen',
  platformUrl: 'https://www.sitecore.com/platform',
  fontFile: '/fonts/sitecore-sans.woff2',
} as const;

/** Platform naming: SitecoreAI is one word (not "Sitecore AI"). */
export const SITECOREAI_BRAND_NOTE =
  'When referring to the platform, write SitecoreAI as one word (e.g. SitecoreAI CMS, SitecoreAI Agentic RAG, SitecoreAI Data Platform).';

export const SITECORE_EVENT_YEAR = 2026;

export const SITECORE_EVENT_YEAR_RULE =
  `Event year is ${SITECORE_EVENT_YEAR} only. Do not display, write, or imply any other calendar year in text, signage, badges, or graphics (no 2024, 2025, 2027, etc.). "25 years" anniversary messaging is fine without showing other years.`;

export const SITECORE_LOGO_PROMPT =
  'CRITICAL — DO NOT CHANGE THE SITECORE LOGO: Never redraw, replace, distort, recolor, animate, embellish, or be creative with the Sitecore logo or any brand wordmarks. ' +
  'Do not add new logos, fake logos, stylized logo variants, or competitor marks. If a Sitecore logo appears in the source photo, preserve it exactly as-is. ' +
  'Official logo overlay is applied after generation — do not invent or modify logo artwork in the output.';

export const SITECORE_LOCATION_PROMPT =
  'Location & theme: All scenes, backgrounds, architecture, and mood must stay anchored in Copenhagen, Denmark — Sitecore Silver 25-year anniversary celebration. ' +
  'Favor Tivoli Gardens atmosphere, Nordic silver celebration styling, elegant evening event lighting, Danish heritage touches. ' +
  'Do not relocate the subject to other cities or generic stock locations.';

export const SITECORE_BACKDROP_PROMPT =
  'Backdrop: Official Sitecore Silver Celebration dark charcoal curtain fabric with subtle grid weave and soft folds (event photo booth aesthetic).';

export const SITECORE_IMAGE_BRAND_RULES = [
  SITECORE_LOGO_PROMPT,
  SITECORE_EVENT_YEAR_RULE,
  SITECORE_LOCATION_PROMPT,
  SITECORE_BACKDROP_PROMPT,
  SITECOREAI_BRAND_NOTE,
  'Keep portraits professional, fully clothed, and recognizable.',
  'No competing brand marks, offensive content, or off-topic fantasy worlds unrelated to the Copenhagen celebration.',
].join(' ');

export const LOGO_MANIPULATION_PATTERNS = [
  /fake\s+logo/i,
  /different\s+logo/i,
  /replace\s+(the\s+)?sitecore\s+logo/i,
  /change\s+(the\s+)?sitecore\s+logo/i,
  /alter\s+(the\s+)?logo/i,
  /wrong\s+logo/i,
  /competitor\s+logo/i,
  /draw\s+(a\s+)?(new\s+)?logo/i,
  /remove\s+(the\s+)?sitecore\s+logo/i,
  /non[- ]?sitecore\s+brand/i,
  /redesign\s+(the\s+)?logo/i,
  /add\s+(a\s+)?(fake|custom|new)\s+logo/i,
  /create\s+(a\s+)?(fake|custom|new)\s+logo/i,
];

/** Calendar years other than the 2026 event year (4-digit). */
export const DISALLOWED_YEAR_PATTERN = /\b(19\d{2}|20(0\d|1\d|2[0-5]|27|28|29|3\d))\b/g;

/** Block prompts that pull the scene away from Copenhagen / celebration */
export const OFF_THEME_LOCATION_PATTERNS = [
  /\b(new york|los angeles|paris|london|tokyo|beach resort|tropical|desert|space station)\b/i,
];

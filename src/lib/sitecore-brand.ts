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

export const SITECORE_LOGO_PROMPT =
  'CRITICAL — DO NOT CHANGE THE SITECORE LOGO: Use only the official Sitecore Silver logo (polished chrome circular emblem with three curved inner segments above "SITECORE" in metallic silver). ' +
  'Never redraw, replace, distort, recolor, animate, or substitute a different logo. Never remove the logo if it is present in the composition.';

export const SITECORE_LOCATION_PROMPT =
  'Location & theme: All scenes, backgrounds, architecture, and mood must stay anchored in Copenhagen, Denmark — Sitecore Silver 25-year anniversary celebration. ' +
  'Favor Tivoli Gardens atmosphere, Nordic silver celebration styling, elegant evening event lighting, Danish heritage touches. ' +
  'Do not relocate the subject to other cities or generic stock locations.';

export const SITECORE_BACKDROP_PROMPT =
  'Backdrop: Official Sitecore Silver Celebration dark charcoal curtain fabric with subtle grid weave and soft folds (event photo booth aesthetic).';

export const SITECORE_IMAGE_BRAND_RULES = [
  SITECORE_LOGO_PROMPT,
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
];

/** Block prompts that pull the scene away from Copenhagen / celebration */
export const OFF_THEME_LOCATION_PATTERNS = [
  /\b(new york|los angeles|paris|london|tokyo|beach resort|tropical|desert|space station)\b/i,
];

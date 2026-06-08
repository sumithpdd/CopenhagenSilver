/**
 * Legacy branding exports — used by Sitecore-specific components.
 * Prefer useAppConfig() in client components and resolveAppConfig() on the server.
 * Set APP_PRESET=sitecore-silver in .env.local for the Copenhagen event defaults.
 */

import { SITECORE_OFFICIAL } from '@/lib/sitecore-brand';

export const BRAND = {
  eventTitle: 'Sitecore Silver Celebration',
  eventSubtitle: '25 Years of Innovation',
  eventTagline: 'Copenhagen · Tivoli · June 11, 2026',
  eventLocation: 'Tivoli, Copenhagen',
  eventDate: 'June 11, 2026',
  eventUrl: SITECORE_OFFICIAL.eventPageUrl,
} as const;

/** Brand assets — prefer local copies; Content Hub URLs for reference / download */
export const BRAND_ASSETS = {
  /** Official Silver logo — sole header / watermark asset */
  logo: SITECORE_OFFICIAL.logoLocal,
  logoRemote: SITECORE_OFFICIAL.logoContentHub,

  /** Official page backdrop (curtain texture) */
  pageBackdrop: SITECORE_OFFICIAL.backdropLocal,
  pageBackdropRemote: SITECORE_OFFICIAL.backdropContentHub,

  curtainTexture: SITECORE_OFFICIAL.backdropLocal,
  tivoliCopenhagen: '/branding/tivoli-copenhagen.jpg',

  desktopBackdrop: '/branding/desktop-backdrop.jpg',
  desktopBackdropV2: '/branding/desktop-backdrop-v2.jpg',
  desktopBackdropV3: '/branding/desktop-backdrop-v3.jpg',

  linkedinCoverV1: '/branding/linkedin-cover-v1.jpg',
  linkedinCoverV2: '/branding/linkedin-cover-v2.jpg',
  outlookEmailSignature: '/branding/outlook-email-signature.jpg',
  profileBadge: '/branding/profile-badge-400.jpg',
  logoLegacy: '/logo.jpg',
} as const;

export type BrandAssetKey = keyof typeof BRAND_ASSETS;

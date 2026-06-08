/**
 * Application configuration — works with or without Sitecore.
 * Standalone: env vars + static data files.
 * Marketplace: same defaults; optional CMS overrides via /api/sitecore/config.
 */

import { backgrounds } from '@/data/backgrounds';
import { prompts } from '@/data/prompts';
import type { Background, PhotoPrompt } from '@/types';
import { getServerRuntimeMode } from './runtime-mode';

export interface BrandingConfig {
  eventTitle: string;
  eventSubtitle: string;
  eventTagline: string;
  eventLocation: string;
  eventDate: string;
  eventUrl: string;
  logoPath: string;
  backdropPath: string;
  watermarkText: string;
  photoCodePrefix: string;
  storagePathPrefix: string;
  copyrightHolder: string;
}

export interface FeatureFlags {
  gallery: boolean;
  admin: boolean;
  sitecoreMarketing: boolean;
  summaryPage: boolean;
}

export interface BrandRulesConfig {
  enabled: boolean;
  locationPrompt: string;
  logoPrompt: string;
  backdropPrompt: string;
  imageBrandRules: string;
}

export interface AppConfig {
  mode: 'standalone' | 'marketplace';
  branding: BrandingConfig;
  features: FeatureFlags;
  brandRules: BrandRulesConfig;
  backgrounds: Background[];
  prompts: PhotoPrompt[];
}

const DEFAULT_BRANDING: BrandingConfig = {
  eventTitle: process.env.APP_EVENT_TITLE ?? 'AI Photo Booth',
  eventSubtitle: process.env.APP_EVENT_SUBTITLE ?? 'Create Your Memory',
  eventTagline:
    process.env.APP_EVENT_TAGLINE ?? 'Capture · transform · share',
  eventLocation: process.env.APP_EVENT_LOCATION ?? '',
  eventDate: process.env.APP_EVENT_DATE ?? '',
  eventUrl: process.env.APP_EVENT_URL ?? '',
  logoPath: process.env.APP_LOGO_PATH ?? '/branding/sitecore-silver-logo-official.png',
  backdropPath:
    process.env.APP_BACKDROP_PATH ?? '/branding/page-backdrop-official.jpg',
  watermarkText: process.env.APP_WATERMARK_TEXT ?? 'AI PHOTO BOOTH',
  photoCodePrefix: process.env.APP_PHOTO_CODE_PREFIX ?? 'PHOTO',
  storagePathPrefix: process.env.APP_STORAGE_PREFIX ?? 'photo-booth',
  copyrightHolder: process.env.APP_COPYRIGHT_HOLDER ?? 'Photo Booth',
};

function parseBoolEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue;
  return value === 'true' || value === '1';
}

/** Server-side config from environment + static data. */
export function getDefaultAppConfig(): AppConfig {
  const sitecoreBrandRules = process.env.APP_SITECORE_BRAND_RULES === 'true';

  return {
    mode: getServerRuntimeMode(),
    branding: DEFAULT_BRANDING,
    features: {
      gallery: parseBoolEnv(process.env.NEXT_PUBLIC_ENABLE_GALLERY, true),
      admin: parseBoolEnv(process.env.NEXT_PUBLIC_ENABLE_ADMIN, true),
      sitecoreMarketing: parseBoolEnv(
        process.env.NEXT_PUBLIC_ENABLE_SITECORE_MARKETING,
        sitecoreBrandRules
      ),
      summaryPage: parseBoolEnv(process.env.NEXT_PUBLIC_ENABLE_SUMMARY, true),
    },
    brandRules: {
      enabled: sitecoreBrandRules,
      locationPrompt: '',
      logoPrompt: '',
      backdropPrompt: '',
      imageBrandRules: '',
    },
    backgrounds,
    prompts,
  };
}

/** Sitecore Silver preset — opt-in via APP_PRESET=sitecore-silver */
export function getSitecoreSilverPreset(): Partial<AppConfig> {
  return {
    branding: {
      eventTitle: 'Sitecore Silver Celebration',
      eventSubtitle: '25 Years of Innovation',
      eventTagline: 'Copenhagen · Tivoli · June 11, 2026',
      eventLocation: 'Tivoli, Copenhagen',
      eventDate: 'June 11, 2026',
      eventUrl:
        'https://www.sitecore.com/resources/events-webinars/2026/05/sitecore-silver-celebration-copenhagen',
      logoPath: '/branding/sitecore-silver-logo-official.png',
      backdropPath: '/branding/page-backdrop-official.jpg',
      watermarkText: 'SITECORE SILVER',
      photoCodePrefix: 'SILVER',
      storagePathPrefix: 'sitecore-silver',
      copyrightHolder: 'Sitecore',
    },
    features: {
      gallery: true,
      admin: true,
      sitecoreMarketing: true,
      summaryPage: true,
    },
    brandRules: {
      enabled: true,
      locationPrompt: '',
      logoPrompt: '',
      backdropPrompt: '',
      imageBrandRules: '',
    },
  };
}

/** Merge preset + env overrides for server routes. */
export function resolveAppConfig(): AppConfig {
  const base = getDefaultAppConfig();

  if (process.env.APP_PRESET === 'sitecore-silver') {
    const preset = getSitecoreSilverPreset();
    return {
      ...base,
      branding: { ...base.branding, ...preset.branding },
      features: { ...base.features, ...preset.features },
      brandRules: { ...base.brandRules, ...preset.brandRules },
    };
  }

  return base;
}

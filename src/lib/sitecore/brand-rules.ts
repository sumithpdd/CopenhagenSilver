/**
 * Sitecore-specific AI brand guardrails.
 * Only applied when APP_SITECORE_BRAND_RULES=true or APP_PRESET=sitecore-silver.
 */

import {
  SITECORE_BACKDROP_PROMPT,
  SITECORE_IMAGE_BRAND_RULES,
  SITECORE_LOCATION_PROMPT,
  SITECORE_LOGO_PROMPT,
} from '@/lib/sitecore-brand';
import type { BrandRulesConfig } from '@/lib/core/app-config';

export function getSitecoreBrandRules(): BrandRulesConfig {
  return {
    enabled: true,
    locationPrompt: SITECORE_LOCATION_PROMPT,
    logoPrompt: SITECORE_LOGO_PROMPT,
    backdropPrompt: SITECORE_BACKDROP_PROMPT,
    imageBrandRules: SITECORE_IMAGE_BRAND_RULES,
  };
}

/**
 * Runtime mode: standalone (kiosk / local dev) vs marketplace (Sitecore iframe).
 */

export type RuntimeMode = 'standalone' | 'marketplace';

/** Server-side: force standalone when Marketplace SDK is not used. */
export function getServerRuntimeMode(): RuntimeMode {
  if (process.env.APP_RUNTIME_MODE === 'marketplace') return 'marketplace';
  if (process.env.APP_RUNTIME_MODE === 'standalone') return 'standalone';
  // Default: standalone unless explicitly marketplace
  return 'standalone';
}

/** Client-side: NEXT_PUBLIC_STANDALONE_MODE=true skips SDK init. */
export function shouldSkipMarketplaceSdk(): boolean {
  return process.env.NEXT_PUBLIC_STANDALONE_MODE === 'true';
}

export function isSitecoreConfigured(): boolean {
  return Boolean(
    process.env.SITECORE_CLIENT_ID &&
      process.env.SITECORE_CLIENT_SECRET &&
      process.env.XMC_HOST
  );
}

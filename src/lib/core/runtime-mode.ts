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

/** Embedded in any parent frame (Sitecore Marketplace iframe). */
export function isEmbeddedInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin parent — definitely embedded
    return true;
  }
}

/** Client-side: skip SDK when standalone env is set or opened as a top-level tab. */
export function shouldSkipMarketplaceSdk(): boolean {
  if (process.env.NEXT_PUBLIC_STANDALONE_MODE === 'true') return true;
  if (process.env.NEXT_PUBLIC_STANDALONE_MODE === 'false') return false;
  return !isEmbeddedInIframe();
}

export function isSitecoreConfigured(): boolean {
  return Boolean(
    process.env.SITECORE_CLIENT_ID &&
      process.env.SITECORE_CLIENT_SECRET &&
      process.env.XMC_HOST
  );
}

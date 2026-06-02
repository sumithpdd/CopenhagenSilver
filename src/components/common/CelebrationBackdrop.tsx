'use client';

import { BRAND_ASSETS } from '@/lib/branding';

/**
 * Official Sitecore Silver Celebration page backdrop (Content Hub curtain texture).
 */
export function CelebrationBackdrop() {
  return (
    <div className="celebration-backdrop" aria-hidden>
      <div
        className="celebration-backdrop__curtain"
        style={{ backgroundImage: `url('${BRAND_ASSETS.pageBackdrop}')` }}
      />
      <div className="celebration-backdrop__vignette" />
    </div>
  );
}

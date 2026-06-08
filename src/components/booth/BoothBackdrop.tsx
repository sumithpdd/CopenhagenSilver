'use client';

import { useAppConfig } from '@/components/providers/app-config-provider';

/** Configurable page backdrop texture. */
export function BoothBackdrop() {
  const { branding } = useAppConfig();

  return (
    <div className="celebration-backdrop" aria-hidden>
      <div
        className="celebration-backdrop__curtain"
        style={{ backgroundImage: `url('${branding.backdropPath}')` }}
      />
      <div className="celebration-backdrop__vignette" />
    </div>
  );
}

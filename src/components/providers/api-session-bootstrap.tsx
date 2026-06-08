'use client';

import { useEffect } from 'react';
import { bootstrapApiSession } from '@/lib/core/api-client';

/** Prefetch API session token so processing works inside Sitecore Marketplace iframes. */
export function ApiSessionBootstrap() {
  useEffect(() => {
    bootstrapApiSession();
  }, []);

  return null;
}

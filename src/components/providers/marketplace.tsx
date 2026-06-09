'use client';

import {
  type ApplicationContext,
  ClientSDK,
} from '@sitecore-marketplace-sdk/client';
import { XMC } from '@sitecore-marketplace-sdk/xmc';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { RuntimeMode } from '@/lib/core/runtime-mode';
import { shouldSkipMarketplaceSdk } from '@/lib/core/runtime-mode';

interface MarketplaceContextValue {
  mode: RuntimeMode;
  client: ClientSDK | null;
  appContext: ApplicationContext | null;
  loading: boolean;
}

const MarketplaceContext = createContext<MarketplaceContextValue>({
  mode: 'standalone',
  client: null,
  appContext: null,
  loading: false,
});

interface MarketplaceProviderProps {
  children: ReactNode;
}

/**
 * Initializes the Marketplace SDK when embedded in Sitecore.
 * Falls back to standalone mode when opened directly (localhost, kiosk).
 * Never blocks the UI — SDK connects in the background.
 */
export function MarketplaceProvider({ children }: MarketplaceProviderProps) {
  const [mode, setMode] = useState<RuntimeMode>('standalone');
  const [client, setClient] = useState<ClientSDK | null>(null);
  const [appContext, setAppContext] = useState<ApplicationContext | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shouldSkipMarketplaceSdk()) {
      setMode('standalone');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const init = async () => {
      try {
        const sdk = await ClientSDK.init({
          target: window.parent,
          modules: [XMC],
        });

        if (cancelled) return;

        setClient(sdk);
        setMode('marketplace');

        const res = await sdk.query('application.context');
        if (!cancelled && res?.data) {
          setAppContext(res.data);
        }
      } catch {
        if (!cancelled) {
          setMode('standalone');
          setClient(null);
          setAppContext(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MarketplaceContext.Provider value={{ mode, client, appContext, loading }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  return useContext(MarketplaceContext);
}

export function useMarketplaceClient(): ClientSDK | null {
  return useContext(MarketplaceContext).client;
}

export function useAppContext(): ApplicationContext | null {
  return useContext(MarketplaceContext).appContext;
}

export function useRuntimeMode(): RuntimeMode {
  return useContext(MarketplaceContext).mode;
}

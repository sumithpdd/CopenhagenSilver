'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AppConfig } from '@/lib/core/app-config';
import { useRuntimeMode } from './marketplace';

const AppConfigContext = createContext<AppConfig | null>(null);

interface AppConfigProviderProps {
  children: ReactNode;
}

export function AppConfigProvider({ children }: AppConfigProviderProps) {
  const runtimeMode = useRuntimeMode();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/config')
      .then((res) => {
        if (!res.ok) throw new Error(`Config load failed: ${res.status}`);
        return res.json();
      })
      .then((body: { success: boolean; data?: AppConfig; error?: string }) => {
        if (cancelled) return;
        if (!body.success || !body.data) {
          throw new Error(body.error ?? 'Invalid config response');
        }
        setConfig({ ...body.data, mode: runtimeMode });
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [runtimeMode]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sc-bg text-sc-text p-6">
        <p className="text-red-400">Failed to load app configuration: {error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sc-bg text-sc-text">
        <p className="text-sc-muted animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <AppConfigContext.Provider value={config}>{children}</AppConfigContext.Provider>
  );
}

export function useAppConfig(): AppConfig {
  const ctx = useContext(AppConfigContext);
  if (!ctx) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return ctx;
}

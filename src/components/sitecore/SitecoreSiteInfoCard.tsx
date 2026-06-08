'use client';

import { useEffect, useState } from 'react';
import { useRuntimeMode } from '@/components/providers/marketplace';
import { IconGallery, IconMapPin } from '@/components/icons/BoothIcons';

interface SiteInfoData {
  configured: boolean;
  site: { name: string; path: string; itemId: string } | null;
  attendeesFolder: {
    name: string;
    path: string;
    itemId: string;
    totalItems: number;
  } | null;
  paths?: {
    site: string;
    attendeesFolder: string;
    attendeeTemplate: string;
    attendeeTemplateId: string;
  };
  error?: string;
}

export function SitecoreSiteInfoCard() {
  const runtimeMode = useRuntimeMode();
  const [info, setInfo] = useState<SiteInfoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/sitecore/site-info')
      .then((res) => res.json())
      .then((body: { success: boolean; data?: SiteInfoData; error?: string }) => {
        if (!cancelled && body.data) {
          setInfo(body.data);
        }
      })
      .catch(() => {
        if (!cancelled) setInfo(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="brand-card max-w-2xl mx-auto w-full p-5 text-left animate-pulse">
        <p className="text-sc-muted text-sm">Loading Sitecore site info…</p>
      </div>
    );
  }

  if (!info?.configured) {
    return (
      <div className="brand-card max-w-2xl mx-auto w-full p-5 text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-sc-muted mb-2">
          Sitecore CMS
        </p>
        <p className="text-sm text-sc-muted">
          Authoring API not configured — attendee pages will not sync to Sitecore.
          Set <code className="text-xs">XMC_HOST</code>,{' '}
          <code className="text-xs">SITECORE_CLIENT_ID</code>, and{' '}
          <code className="text-xs">SITECORE_CLIENT_SECRET</code> in environment variables.
        </p>
      </div>
    );
  }

  if (info.error) {
    return (
      <div className="brand-card max-w-2xl mx-auto w-full p-5 text-left border border-red-500/30">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
          Sitecore connection error
        </p>
        <p className="text-sm text-sc-muted break-all">{info.error}</p>
      </div>
    );
  }

  const siteName = info.site?.name ?? 'sitecoresilver';
  const sitePath = info.site?.path ?? info.paths?.site ?? '';
  const attendeesPath =
    info.attendeesFolder?.path ?? info.paths?.attendeesFolder ?? '';
  const attendeeCount = info.attendeesFolder?.totalItems ?? 0;

  return (
    <div className="brand-card max-w-2xl mx-auto w-full p-5 md:p-6 text-left space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-muted mb-1">
            Connected Sitecore site
          </p>
          <p className="text-lg font-bold text-white">{siteName}</p>
          <p className="text-xs font-mono text-sc-muted break-all mt-1">{sitePath}</p>
        </div>
        {runtimeMode === 'marketplace' && (
          <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Marketplace
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-black/30 border border-white/10 p-3">
          <p className="text-sc-muted flex items-center gap-2 mb-1">
            <IconMapPin size={16} />
            Attendees folder
          </p>
          <p className="font-mono text-xs text-silver-300 break-all">{attendeesPath}</p>
        </div>
        <div className="rounded-lg bg-black/30 border border-white/10 p-3">
          <p className="text-sc-muted flex items-center gap-2 mb-1">
            <IconGallery size={16} />
            Attendee profiles
          </p>
          <p className="text-2xl font-bold text-white">{attendeeCount}</p>
          <p className="text-xs text-sc-muted">items in SilverAttendees</p>
        </div>
      </div>
    </div>
  );
}

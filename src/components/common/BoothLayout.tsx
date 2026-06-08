'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { BoothBackdrop } from '@/components/booth/BoothBackdrop';
import { BoothLogo } from '@/components/booth/BoothLogo';
import { useAppConfig } from '@/components/providers/app-config-provider';

interface BoothLayoutProps {
  children: ReactNode;
  hideBack?: boolean;
  hideFooter?: boolean;
}

export function BoothLayout({
  children,
  hideBack = false,
  hideFooter = false,
}: BoothLayoutProps) {
  const { branding, features } = useAppConfig();

  return (
    <div className="min-h-screen flex flex-col relative">
      <BoothBackdrop />

      <header className="relative z-20 py-4 px-4 md:px-8 border-b border-sc-border bg-sc-surface/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <BoothLogo size="md" />
          {!hideBack && (
            <Link href="/" className="btn-silver-outline !py-2 !px-4 text-sm shrink-0">
              ← Home
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 relative z-10">{children}</main>

      {!hideFooter && (
        <footer className="relative z-20 py-5 px-4 border-t border-sc-border text-center text-sm text-sc-muted bg-sc-surface/80 backdrop-blur-md">
          <p className="font-medium text-white">{branding.eventTitle}</p>
          <p className="text-sc-muted">{branding.eventTagline}</p>
          <p className="text-xs mt-2 text-sc-muted">
            © {new Date().getFullYear()} {branding.copyrightHolder} · {branding.eventSubtitle}
            {' · '}
            <Link href="/privacy" className="underline hover:text-silver-300">
              Privacy
            </Link>
            {features.admin && (
              <>
                {' · '}
                <Link href="/admin" className="underline hover:text-silver-300">
                  Admin
                </Link>
              </>
            )}
          </p>
        </footer>
      )}
    </div>
  );
}

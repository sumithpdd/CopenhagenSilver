'use client';

import Link from 'next/link';
import { BoothLayout } from '@/components/common/BoothLayout';
import { GDPR_SECTIONS, GDPR_SUMMARY } from '@/lib/gdpr';

export default function PrivacyPage() {
  return (
    <BoothLayout>
      <div className="max-w-2xl mx-auto p-4 py-10 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold silver-accent mb-2">
            Privacy & Terms
          </h1>
          <p className="text-silver-400 text-sm">
            Sitecore Silver Celebration · Copenhagen 2026 · AI Photo Booth
          </p>
        </div>

        <div className="brand-card p-6 md:p-8 space-y-6">
          <p className="text-silver-300 leading-relaxed">{GDPR_SUMMARY}</p>

          {GDPR_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-white mb-2">{section.title}</h2>
              <p className="text-sm text-silver-300 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="text-center">
          <Link href="/input" className="btn-silver">
            Back to booth
          </Link>
        </div>
      </div>
    </BoothLayout>
  );
}

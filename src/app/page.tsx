'use client';

import Link from 'next/link';
import { BoothLayout } from '@/components/common/BoothLayout';
import { useAppConfig } from '@/components/providers/app-config-provider';
import { SitecoreAiFlow } from '@/components/sitecore';
import {
  IconArrowRight,
  IconCalendar,
  IconCamera,
  IconGallery,
  IconMapPin,
  IconSparkles,
} from '@/components/icons/BoothIcons';

export default function Home() {
  const { branding, features } = useAppConfig();

  return (
    <BoothLayout hideBack>
      <section className="relative flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-4xl mx-auto text-center space-y-10 animate-fade-in z-10">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <span className="hero-stat-pill">
              <IconSparkles size={16} />
              25 Years
            </span>
            <span className="hero-stat-pill">
              <IconMapPin size={16} />
              Tivoli · Copenhagen
            </span>
            <span className="hero-stat-pill">
              <IconCamera size={16} />
              AI Photo Booth
            </span>
          </div>

          <div className="space-y-5 px-2">
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <h1 className="display-hero silver-shimmer">
              {branding.eventTitle.split(' ').slice(-1)[0] ?? 'Booth'}
            </h1>
            <p className="display-lead max-w-2xl mx-auto">{branding.eventSubtitle}</p>
            <p className="text-base md:text-lg text-accent-muted font-medium tracking-wide">
              {branding.eventTagline}
            </p>
          </div>

          <p className="display-body mx-auto px-2">
            Step into the booth, choose a backdrop, and let AI transform your portrait into a
            keepsake{branding.eventLocation ? ` from ${branding.eventLocation}` : ''}.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto pt-2">
            <Link href="/input" className="booth-cta-card booth-cta-card--primary group">
              <span className="booth-cta-card__icon group-hover:scale-105 transition-transform">
                <IconCamera size={28} />
              </span>
              <span className="booth-cta-card__title">Create Photo</span>
              <span className="booth-cta-card__desc">Capture · transform · share</span>
            </Link>

            {features.gallery && (
            <Link href="/gallery" className="booth-cta-card group">
              <span className="booth-cta-card__icon group-hover:scale-105 transition-transform">
                <IconGallery size={28} />
              </span>
              <span className="booth-cta-card__title">View Gallery</span>
              <span className="booth-cta-card__desc">See the community wall</span>
            </Link>
            )}
          </div>

          {features.sitecoreMarketing && <SitecoreAiFlow />}

          {branding.eventUrl && (
          <div className="heritage-strip max-w-2xl mx-auto w-full text-left">
            <div
              className="heritage-strip__visual"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.2)), url('/branding/tivoli-copenhagen.jpg')`,
              }}
            />
            <div className="heritage-strip__body">
              <p className="heritage-strip__text">
                <IconMapPin size={22} />
                <span>
                  {branding.eventLocation
                    ? `Celebrating at ${branding.eventLocation}.`
                    : branding.eventSubtitle}
                </span>
              </p>
              <a
                href={branding.eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sitecore-red shrink-0 inline-flex items-center gap-2"
              >
                <IconCalendar size={18} />
                Event details
                <IconArrowRight size={18} />
              </a>
            </div>
          </div>
          )}
        </div>
      </section>
    </BoothLayout>
  );
}

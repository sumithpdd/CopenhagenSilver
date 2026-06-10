'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BoothLayout } from '@/components/common/BoothLayout';
import { usePhotoBoothStore } from '@/store/photo-booth';
import {
  pickFactsForSession,
  celebrationTaglines,
} from '@/data/sitecore-facts';
import { BRAND, BRAND_ASSETS } from '@/lib/branding';
import { downloadImage, printPhoto } from '@/lib/photo-actions';

export default function SummaryPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((s) => s.session);
  const capturedPhoto = usePhotoBoothStore((s) => s.capturedPhoto);
  const compositedPhotoUrl = usePhotoBoothStore((s) => s.compositedPhotoUrl);
  const photoCode = usePhotoBoothStore((s) => s.photoCode);
  const selectedBackground = usePhotoBoothStore((s) => s.selectedBackground);
  const selectedPrompt = usePhotoBoothStore((s) => s.selectedPrompt);
  const resetSession = usePhotoBoothStore((s) => s.resetSession);

  const composited = compositedPhotoUrl ?? capturedPhoto;
  const facts = useMemo(
    () => (session ? pickFactsForSession(session.sessionId, 5) : []),
    [session]
  );
  const tagline = useMemo(() => {
    if (!session) return celebrationTaglines[0];
    const idx =
      Math.abs(session.sessionId.charCodeAt(0)) % celebrationTaglines.length;
    return celebrationTaglines[idx];
  }, [session]);

  useEffect(() => {
    if (!session || !composited) {
      router.push('/input');
    }
  }, [session, composited, router]);

  if (!session || !composited) return null;

  const handlePrintKeepsake = () => {
    printPhoto(composited, {
      code: photoCode ?? undefined,
      subtitle: `${BRAND.eventTitle} · ${BRAND.eventLocation}`,
    });
  };

  return (
    <BoothLayout>
      <div className="px-4 py-10 max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold silver-shimmer">
            Your Silver Keepsake
          </h1>
          <p className="text-silver-300 text-lg max-w-xl mx-auto">{tagline}</p>
          {photoCode && (
            <p className="text-sm text-silver-500 uppercase tracking-widest">
              Photo code · {photoCode}
            </p>
          )}
        </div>

        {/* Guest of honor */}
        <section className="brand-card p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold text-silver-200 border-b border-white/10 pb-3">
            Celebrating
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-silver-500 uppercase text-xs tracking-wide">Name</p>
              <p className="text-xl font-bold text-white">{session.userName}</p>
            </div>
            {session.userEmail && (
              <div>
                <p className="text-silver-500 uppercase text-xs tracking-wide">Email</p>
                <p className="text-silver-200">{session.userEmail}</p>
              </div>
            )}
            {selectedBackground && (
              <div>
                <p className="text-silver-500 uppercase text-xs tracking-wide">Background</p>
                <p className="text-silver-200">{selectedBackground.name}</p>
              </div>
            )}
            {selectedPrompt && (
              <div>
                <p className="text-silver-500 uppercase text-xs tracking-wide">
                  Transformation
                </p>
                <p className="text-silver-200">{selectedPrompt.title}</p>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-2">
            {capturedPhoto && compositedPhotoUrl && capturedPhoto !== compositedPhotoUrl && (
              <div>
                <p className="text-xs text-silver-500 mb-2 uppercase tracking-wide">
                  Original
                </p>
                <img
                  src={capturedPhoto}
                  alt="Original"
                  className="w-full rounded-lg border border-white/20 max-h-56 object-contain bg-black"
                />
              </div>
            )}
            <div className={capturedPhoto && compositedPhotoUrl ? '' : 'md:col-span-2'}>
              <p className="text-xs text-silver-500 mb-2 uppercase tracking-wide">
                AI Enhanced
              </p>
              <img
                src={composited}
                alt="Your creation"
                className="w-full rounded-lg border-2 border-silver-400/50 max-h-56 object-contain bg-black"
              />
            </div>
          </div>
        </section>

        {/* 25 years timeline */}
        <section className="brand-card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="hidden sm:block w-24 h-16 shrink-0 rounded opacity-60 bg-cover bg-center"
              style={{ backgroundImage: `url('${BRAND_ASSETS.tivoliCopenhagen}')` }}
              aria-hidden
            />
            <div>
              <h2 className="text-xl font-bold text-silver-200">
                25 Years of Sitecore
              </h2>
              <p className="text-silver-400 text-sm mt-1">
                Milestones from our journey — curated for your celebration card
              </p>
            </div>
          </div>

          <ul className="space-y-4">
            {facts.map((m) => (
              <li
                key={`${m.year}-${m.title}`}
                className="flex gap-4 border-l-2 border-accent-muted/50 pl-4 py-1"
              >
                <span className="milestone-year text-2xl font-bold shrink-0 w-16">
                  {m.year}
                </span>
                <div>
                  <p className="font-bold text-white">{m.title}</p>
                  <p className="text-silver-400 text-sm mt-0.5">{m.fact}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Digital Swag — email signature strip */}
        <section className="brand-card overflow-hidden">
          <img
            src={BRAND_ASSETS.outlookEmailSignature}
            alt="Sitecore Silver — 25 years"
            className="w-full h-auto object-cover opacity-95"
          />
          <p className="text-center text-xs text-silver-500 py-3 px-4">
            Official Sitecore Silver digital swag · Corporate Comms
          </p>
        </section>

        {/* Event CTA */}
        <section className="brand-card p-6 text-center space-y-4">
          <p className="text-silver-300">
            Join us at {BRAND.eventLocation} on {BRAND.eventDate} for the official{' '}
            {BRAND.eventTitle}.
          </p>
          <a
            href={BRAND.eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sitecore-red inline-block"
          >
            Learn about the celebration →
          </a>
        </section>

        <div className="flex flex-wrap gap-3 justify-center pb-8">
          <button
            type="button"
            className="btn-silver"
            onClick={() =>
              downloadImage(composited, `sitecore-silver-keepsake-${photoCode ?? 'photo'}.jpg`)
            }
          >
            ⬇️ Download keepsake
          </button>
          <button type="button" className="btn-silver-outline" onClick={handlePrintKeepsake}>
            🖨️ Print
          </button>
          <Link href="/gallery" className="btn-silver-outline">
            🖼️ Gallery
          </Link>
          <button
            type="button"
            className="btn-silver-outline"
            onClick={() => {
              resetSession();
              router.push('/input');
            }}
          >
            📸 New photo
          </button>
        </div>
      </div>
    </BoothLayout>
  );
}

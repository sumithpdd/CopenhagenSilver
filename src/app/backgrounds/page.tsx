'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { backgrounds } from '@/data/backgrounds';
import { useEffect } from 'react';
import { BoothLayout } from '@/components/common/BoothLayout';
import { BRAND_ASSETS } from '@/lib/branding';

export default function BackgroundsPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((state) => state.session);
  const capturedPhoto = usePhotoBoothStore((state) => state.capturedPhoto);
  const selectedBackground = usePhotoBoothStore((state) => state.selectedBackground);
  const setSelectedBackground = usePhotoBoothStore(
    (state) => state.setSelectedBackground
  );

  useEffect(() => {
    if (!session || !capturedPhoto) {
      router.push('/input');
    }
  }, [session, capturedPhoto, router]);

  const handleSelect = (background: (typeof backgrounds)[0]) => {
    setSelectedBackground(background);
    router.push('/prompts');
  };

  if (!session || !capturedPhoto) return null;

  return (
    <BoothLayout>
      <div className="flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-5xl space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold silver-accent">
              Choose Your Background
            </h2>
            <p className="text-silver-300 max-w-lg mx-auto">
              Select a Silver Celebration backdrop — including Tivoli Copenhagen
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {backgrounds.map((background) => {
              const isSelected = selectedBackground?.id === background.id;
              const isFeatured =
                background.id === 'tivoli' ||
                background.id === 'desktop-v3' ||
                background.id === 'linkedin-v1';

              return (
                <button
                  key={background.id}
                  type="button"
                  onClick={() => handleSelect(background)}
                  className={`group relative overflow-hidden rounded-xl text-left transition-all duration-300 ${
                    isSelected
                      ? 'ring-2 ring-sitecore-red shadow-lg shadow-sitecore-red/20 scale-[1.02]'
                      : 'ring-1 ring-white/15 hover:ring-silver-400/50'
                  }`}
                >
                  <div className="relative w-full h-52 md:h-56 bg-black overflow-hidden">
                    <img
                      src={background.imageUrl}
                      alt={background.name}
                      className={`w-full h-full object-cover transition duration-500 group-hover:scale-105 ${
                        background.id === 'tivoli' ? 'object-bottom opacity-90' : 'opacity-85'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    {isFeatured && (
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-bold uppercase tracking-wider bg-sitecore-red text-white px-2 py-1 rounded">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <h3 className="text-lg font-bold text-white">{background.name}</h3>
                    <p className="text-sm text-silver-300 mt-1">{background.description}</p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-silver-300 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="brand-card p-4 flex items-center gap-4 max-w-2xl mx-auto"
            aria-hidden
          >
            <Image
              src={BRAND_ASSETS.tivoliCopenhagen}
              alt=""
              width={120}
              height={60}
              className="h-14 w-auto object-contain opacity-70 hidden sm:block"
            />
            <p className="text-sm text-silver-400">
              Tivoli imagery celebrates the Copenhagen home of Sitecore and the Silver
              event venue.
            </p>
          </div>

          {selectedBackground && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => router.push('/prompts')}
                className="btn-silver text-lg px-10"
              >
                Continue to Prompts →
              </button>
            </div>
          )}
        </div>
      </div>
    </BoothLayout>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { backgrounds } from '@/data/backgrounds';
import { useEffect } from 'react';

export default function BackgroundsPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((state) => state.session);
  const capturedPhoto = usePhotoBoothStore((state) => state.capturedPhoto);
  const selectedBackground = usePhotoBoothStore((state) => state.selectedBackground);
  const setSelectedBackground = usePhotoBoothStore(
    (state) => state.setSelectedBackground
  );

  // Redirect if no session or photo
  useEffect(() => {
    if (!session || !capturedPhoto) {
      router.push('/input');
    }
  }, [session, capturedPhoto, router]);

  const handleSelect = (background: typeof backgrounds[0]) => {
    setSelectedBackground(background);
    router.push('/prompts');
  };

  if (!session || !capturedPhoto) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 border-b border-silver-400 border-opacity-20">
        <Link href="/" className="text-2xl font-bold silver-accent hover:text-silver-300 transition">
          ← Sitecore Silver
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="space-y-8 animate-fade-in">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 silver-accent">
                Choose Your Background
              </h2>
              <p className="text-silver-300">
                Select the perfect backdrop for your photo
              </p>
            </div>

            {/* Background Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {backgrounds.map((background) => (
                <button
                  key={background.id}
                  onClick={() => handleSelect(background)}
                  className={`group relative overflow-hidden rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    selectedBackground?.id === background.id
                      ? 'ring-4 ring-silver-400'
                      : 'silver-bg'
                  }`}
                >
                  {/* Background Image */}
                  <div className="relative w-full h-60 bg-black overflow-hidden">
                    <img
                      src={background.imageUrl}
                      alt={background.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-60" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {background.name}
                    </h3>
                    <p className="text-sm text-silver-200">
                      {background.description}
                    </p>
                  </div>

                  {/* Selected Indicator */}
                  {selectedBackground?.id === background.id && (
                    <div className="absolute top-4 right-4 bg-silver-400 text-black rounded-full p-2">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Continue Button */}
            {selectedBackground && (
              <div className="flex justify-center">
                <button
                  onClick={() => router.push('/prompts')}
                  className="px-8 py-3 bg-silver-400 text-black font-bold rounded hover:bg-silver-500 transition text-lg"
                >
                  Continue to Prompts →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-silver-400 border-opacity-20 text-center text-sm text-silver-400">
        <p>© 2026 Sitecore | 25 Years of Innovation</p>
      </footer>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { useEffect, useState } from 'react';

export default function ProcessingPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((state) => state.session);
  const capturedPhoto = usePhotoBoothStore((state) => state.capturedPhoto);
  const selectedBackground = usePhotoBoothStore((state) => state.selectedBackground);
  const selectedPrompt = usePhotoBoothStore((state) => state.selectedPrompt);
  const setCompositedPhoto = usePhotoBoothStore((state) => state.setCompositedPhoto);

  const [error, setError] = useState<string | null>(null);

  // Redirect if missing required data
  useEffect(() => {
    if (!session || !capturedPhoto || !selectedBackground || !selectedPrompt) {
      router.push('/input');
    }
  }, [session, capturedPhoto, selectedBackground, selectedPrompt, router]);

  // Process image with Gemini API
  useEffect(() => {
    async function processImage() {
      try {
        console.log('🎨 Processing image with Gemini...');

        const response = await fetch('/api/composit-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photo: capturedPhoto,
            backgroundDescription: selectedBackground?.description || '',
            prompt: selectedPrompt?.description || selectedPrompt?.title || '',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process image');
        }

        const result = await response.json();

        if (result.success && result.data?.compositedPhoto) {
          console.log('✅ Image processed successfully');
          setCompositedPhoto(result.data.compositedPhoto);

          // Redirect to result page after a short delay
          setTimeout(() => {
            router.push('/result');
          }, 1000);
        } else {
          throw new Error('No image data returned from API');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Processing error:', errorMsg);
        setError(errorMsg);

        // Show error for 3 seconds then go back
        setTimeout(() => {
          router.push('/prompts');
        }, 3000);
      }
    }

    if (capturedPhoto && selectedBackground && selectedPrompt) {
      processImage();
    }
  }, [capturedPhoto, selectedBackground, selectedPrompt, router, setCompositedPhoto]);

  if (!session || !capturedPhoto || !selectedBackground || !selectedPrompt)
    return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 border-b border-silver-400 border-opacity-20">
        <div className="text-2xl font-bold silver-accent">Sitecore Silver</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-8 w-full max-w-2xl">
          {error ? (
            // Error State
            <div className="space-y-6">
              <div className="text-6xl">⚠️</div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-red-400">
                  Processing Error
                </h2>
                <p className="text-silver-300 text-lg mb-4">
                  {error}
                </p>
                <p className="text-silver-400">
                  Returning to prompt selection...
                </p>
              </div>
            </div>
          ) : (
            // Processing State
            <>
              {/* Loading Animation */}
              <div className="flex justify-center">
                <div className="animate-spin">
                  <div className="w-20 h-20 border-4 border-silver-400 border-t-transparent rounded-full" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 silver-accent">
                  Creating Your Photo...
                </h2>
                <p className="text-silver-300 text-lg">
                  Our AI is working its magic ✨
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <p className="text-silver-400">Background: {selectedBackground?.name}</p>
                <p className="text-silver-400">Transformation: {selectedPrompt?.title}</p>
              </div>

              {/* Progress */}
              <div className="max-w-sm mx-auto">
                <div className="bg-silver-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-silver-400 h-full w-2/3 animate-pulse" />
                </div>
                <p className="text-sm text-silver-400 mt-2">Calling Gemini AI...</p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-silver-400 border-opacity-20 text-center text-sm text-silver-400">
        <p>© 2026 Sitecore | 25 Years of Innovation</p>
      </footer>
    </div>
  );
}

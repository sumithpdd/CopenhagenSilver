'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { useCameraCapture } from '@/lib/hooks';
import { useEffect } from 'react';

export default function CameraPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((state) => state.session);
  const setCapturedPhoto = usePhotoBoothStore((state) => state.setCapturedPhoto);

  const {
    videoRef,
    canvasRef,
    fileInputRef,
    capturedPhoto,
    startCamera,
    capturePhoto,
    selectFromGallery,
    handleFileSelect,
    stopCamera,
  } = useCameraCapture();

  // Redirect if no session
  useEffect(() => {
    if (!session) {
      router.push('/input');
    }
  }, [session, router]);

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      setCapturedPhoto(photo);
      router.push('/backgrounds');
    }
  };

  const handleContinue = () => {
    if (capturedPhoto) {
      setCapturedPhoto(capturedPhoto);
      router.push('/backgrounds');
    }
  };

  // Start camera when component mounts
  useEffect(() => {
    if (!capturedPhoto) {
      startCamera().catch((error) => {
        console.error('Camera error:', error);
        alert('Could not access camera. Please check permissions.');
      });
    }

    return () => {
      stopCamera();
    };
  }, [capturedPhoto, startCamera, stopCamera]);

  if (!session) return null;

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
        <div className="w-full max-w-2xl">
          <div className="space-y-6 animate-fade-in">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 silver-accent">
                Ready to be photographed?
              </h2>
              <p className="text-silver-300">
                {capturedPhoto ? 'Photo captured! Ready to continue?' : 'Smile for the camera'}
              </p>
            </div>

            {/* Camera or Photo Preview */}
            <div className="silver-bg p-6 rounded-lg">
              {capturedPhoto ? (
                <div className="space-y-4">
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-full rounded-lg border-2 border-silver-400"
                  />
                  <button
                    onClick={() => {
                      stopCamera();
                      startCamera();
                    }}
                    className="w-full px-4 py-2 bg-silver-600 text-black font-bold rounded hover:bg-silver-500 transition"
                  >
                    ← Retake Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                    width={1200}
                    height={1800}
                  />
                  <button
                    onClick={handleCapture}
                    className="w-full px-6 py-3 bg-silver-400 text-black font-bold rounded hover:bg-silver-500 transition text-lg"
                  >
                    📸 Capture Photo
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={selectFromGallery}
                className="px-4 py-2 bg-silver-600 text-black font-bold rounded hover:bg-silver-500 transition"
              >
                📁 Upload
              </button>
              {capturedPhoto && (
                <button
                  onClick={handleContinue}
                  className="px-4 py-2 bg-silver-400 text-black font-bold rounded hover:bg-silver-500 transition"
                >
                  Continue →
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
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

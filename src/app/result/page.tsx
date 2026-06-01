'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { useEffect, useState } from 'react';

export default function ResultPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((state) => state.session);
  const capturedPhoto = usePhotoBoothStore((state) => state.capturedPhoto);
  const selectedBackground = usePhotoBoothStore((state) => state.selectedBackground);
  const selectedPrompt = usePhotoBoothStore((state) => state.selectedPrompt);
  const resetSession = usePhotoBoothStore((state) => state.resetSession);

  const [photoCode] = useState(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SILVER${timestamp}${random}`;
  });

  // Redirect if missing required data
  useEffect(() => {
    if (!session || !capturedPhoto || !selectedBackground || !selectedPrompt) {
      router.push('/input');
    }
  }, [session, capturedPhoto, selectedBackground, selectedPrompt, router]);

  const handleCreateNew = () => {
    resetSession();
    router.push('/input');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = capturedPhoto!;
    link.download = `sitecore-silver-${photoCode}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1200');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sitecore Silver - ${photoCode}</title>
            <style>
              * { margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; background: white; }
              .container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
              img { max-width: 90%; max-height: 80vh; object-fit: contain; }
              .footer { margin-top: 20px; text-align: center; color: #808080; }
              .code { font-weight: bold; color: #b8b8b8; font-size: 14px; }
              @media print {
                body { margin: 0; padding: 0; }
                .container { padding: 0; }
                img { max-width: 100%; max-height: 100vh; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${capturedPhoto}" alt="Your Sitecore Silver Photo" />
              <div class="footer">
                <p class="code">${photoCode}</p>
                <p>Sitecore Silver • 25 Years of Innovation • Copenhagen 2026</p>
              </div>
            </div>
            <script>
              window.print();
              window.addEventListener('afterprint', () => {
                window.close();
              });
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (!session || !capturedPhoto || !selectedBackground || !selectedPrompt)
    return null;

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
        <div className="w-full max-w-2xl space-y-8 animate-fade-in">
          {/* Photo Code */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 silver-accent">
              Your Photo: {photoCode}
            </h2>
            <p className="text-silver-300">
              Share this code to find your photo in the gallery
            </p>
          </div>

          {/* Photo Preview */}
          <div className="silver-bg p-6 rounded-lg">
            <img
              src={capturedPhoto}
              alt="Your creation"
              className="w-full rounded-lg border-4 border-silver-400"
            />
          </div>

          {/* Photo Details */}
          <div className="grid grid-cols-2 gap-4 silver-bg p-6 rounded-lg text-sm">
            <div>
              <p className="text-silver-400">Background</p>
              <p className="font-bold">{selectedBackground.name}</p>
            </div>
            <div>
              <p className="text-silver-400">Transformation</p>
              <p className="font-bold">{selectedPrompt.title}</p>
            </div>
            <div>
              <p className="text-silver-400">Created By</p>
              <p className="font-bold">{session.userName}</p>
            </div>
            <div>
              <p className="text-silver-400">Code</p>
              <p className="font-bold">{photoCode}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={handleDownload}
              className="px-4 py-3 bg-silver-600 text-black font-bold rounded hover:bg-silver-500 transition"
            >
              ⬇️ Download
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-3 bg-silver-600 text-black font-bold rounded hover:bg-silver-500 transition"
            >
              🖨️ Print
            </button>
            <button
              onClick={() => router.push('/gallery')}
              className="px-4 py-3 bg-silver-600 text-black font-bold rounded hover:bg-silver-500 transition"
            >
              🖼️ Gallery
            </button>
          </div>

          {/* Create New */}
          <button
            onClick={handleCreateNew}
            className="w-full px-6 py-3 bg-silver-400 text-black font-bold rounded hover:bg-silver-500 transition text-lg"
          >
            📸 Create Another Photo
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-silver-400 border-opacity-20 text-center text-sm text-silver-400">
        <p>© 2026 Sitecore | 25 Years of Innovation</p>
      </footer>
    </div>
  );
}

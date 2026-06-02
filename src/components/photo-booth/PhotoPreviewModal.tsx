'use client';

import { useEffect, useState } from 'react';
import { downloadImage, printImages } from '@/lib/photo-actions';

export interface PhotoPreviewData {
  photoCode: string;
  userName: string;
  compositedPhotoUrl: string;
  originalPhotoUrl?: string;
  backgroundId?: string;
  createdAt?: string;
}

interface PhotoPreviewModalProps {
  photo: PhotoPreviewData | null;
  onClose: () => void;
}

export function PhotoPreviewModal({ photo, onClose }: PhotoPreviewModalProps) {
  const [downloading, setDownloading] = useState<'original' | 'composite' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [photo, onClose]);

  if (!photo) return null;

  const hasOriginal = Boolean(photo.originalPhotoUrl);

  const handleDownload = async (type: 'original' | 'composite') => {
    setError(null);
    setDownloading(type);
    try {
      const src =
        type === 'original' && photo.originalPhotoUrl
          ? photo.originalPhotoUrl
          : photo.compositedPhotoUrl;
      await downloadImage(src, `sitecore-silver-${photo.photoCode}-${type}.jpg`);
    } catch {
      setError('Download failed. Try again or open the image in a new tab.');
    } finally {
      setDownloading(null);
    }
  };

  const handlePrint = () => {
    const images = [];
    if (photo.originalPhotoUrl) {
      images.push({ src: photo.originalPhotoUrl, label: 'Original' });
    }
    images.push({ src: photo.compositedPhotoUrl, label: 'AI Enhanced' });
    printImages(images, { code: photo.photoCode });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      role="dialog"
      aria-modal="true"
      aria-label="Photo preview"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto silver-bg rounded-xl border border-silver-400/30 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 text-white text-xl hover:bg-black/80 transition"
          aria-label="Close preview"
        >
          ×
        </button>

        <div className="p-6 space-y-6">
          <div className="pr-10">
            <h3 className="text-2xl font-bold silver-accent">{photo.photoCode}</h3>
            <p className="text-silver-300">
              {photo.userName}
              {photo.createdAt &&
                ` · ${new Date(photo.createdAt).toLocaleDateString()}`}
            </p>
          </div>

          <div
            className={`grid gap-4 ${hasOriginal ? 'md:grid-cols-2' : 'grid-cols-1'}`}
          >
            {hasOriginal && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-silver-400 uppercase tracking-wide">
                  Original
                </p>
                <img
                  src={photo.originalPhotoUrl}
                  alt={`${photo.photoCode} original`}
                  className="w-full rounded-lg border-2 border-silver-500/40 object-contain max-h-[50vh] bg-black"
                />
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-bold text-silver-400 uppercase tracking-wide">
                AI Enhanced
              </p>
              <img
                src={photo.compositedPhotoUrl}
                alt={`${photo.photoCode} composited`}
                className="w-full rounded-lg border-2 border-silver-400 object-contain max-h-[50vh] bg-black"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {hasOriginal && (
              <button
                type="button"
                disabled={downloading !== null}
                onClick={() => handleDownload('original')}
                className="px-4 py-2 bg-silver-600 text-black font-bold rounded hover:bg-silver-500 transition disabled:opacity-50"
              >
                {downloading === 'original' ? 'Downloading…' : '⬇️ Original'}
              </button>
            )}
            <button
              type="button"
              disabled={downloading !== null}
              onClick={() => handleDownload('composite')}
              className="px-4 py-2 bg-silver-400 text-black font-bold rounded hover:bg-silver-500 transition disabled:opacity-50"
            >
              {downloading === 'composite' ? 'Downloading…' : '⬇️ Enhanced'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-silver-600 text-black font-bold rounded hover:bg-silver-500 transition"
            >
              🖨️ Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-silver-outline !py-2 !px-4 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

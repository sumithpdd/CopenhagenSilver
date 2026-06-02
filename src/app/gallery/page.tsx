'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PhotoPreviewModal, PhotoPreviewData } from '@/components/photo-booth/PhotoPreviewModal';
import { BoothLayout } from '@/components/common/BoothLayout';
import { FormInput } from '@/components/ui/FormInput';
import { GDPR_FOOTER } from '@/lib/gdpr';

interface GalleryPhoto {
  id: string;
  photoCode: string;
  userName: string;
  backgroundId: string;
  promptId: string;
  originalPhotoUrl: string;
  compositedPhotoUrl: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoPreviewData | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch('/api/gallery?limit=100&offset=0', {
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `Gallery API error: ${response.status}`
          );
        }

        if (result.success && result.data?.photos) {
          setGalleryPhotos(
            result.data.photos.map((p: GalleryPhoto) => ({
              ...p,
              createdAt:
                typeof p.createdAt === 'string'
                  ? p.createdAt
                  : new Date(p.createdAt).toISOString(),
            }))
          );
        } else {
          setGalleryPhotos([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery');
        setGalleryPhotos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  const filteredPhotos = galleryPhotos.filter((photo) => {
    const matchesSearch =
      photo.photoCode.includes(searchQuery.toUpperCase()) ||
      photo.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || photo.backgroundId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const openPreview = (photo: GalleryPhoto) => {
    setPreviewPhoto({
      photoCode: photo.photoCode,
      userName: photo.userName,
      compositedPhotoUrl: photo.compositedPhotoUrl,
      originalPhotoUrl: photo.originalPhotoUrl,
      backgroundId: photo.backgroundId,
      createdAt: photo.createdAt,
    });
  };

  return (
    <BoothLayout>
      <div className="p-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="page-title mb-2 silver-accent">Community Gallery</h2>
            <p className="page-subtitle">
              Tap a photo to view full size, download, or print
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <FormInput
              type="text"
              placeholder="Search by photo code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="btn-silver-outline"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'heritage', 'celebration', 'innovation'].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === category
                    ? 'btn-silver !py-2'
                    : 'btn-silver-outline !py-2'
                }`}
              >
                {category === 'all'
                  ? 'All'
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin inline-block">
                <div className="w-12 h-12 border-4 border-silver-400 border-t-transparent rounded-full" />
              </div>
              <p className="text-silver-300 mt-4">Loading gallery...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12 bg-red-900 bg-opacity-20 rounded p-6">
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}

          {!loading && filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => openPreview(photo)}
                  className="group relative overflow-hidden rounded-lg silver-bg hover:ring-4 hover:ring-silver-400 transition text-left w-full"
                >
                  <div className="relative w-full h-48 bg-black">
                    <img
                      src={photo.compositedPhotoUrl}
                      alt={photo.photoCode}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60 group-hover:opacity-80 transition pointer-events-none" />

                  <div className="absolute inset-0 flex flex-col justify-end p-3 pointer-events-none">
                    <p className="text-xs text-silver-200">{photo.photoCode}</p>
                    <p className="font-bold text-white">{photo.userName}</p>
                    <p className="text-xs text-silver-300">
                      {new Date(photo.createdAt).toLocaleDateString()} · Tap to view
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-12 silver-bg rounded-lg">
                <p className="text-silver-400 text-lg">No photos found</p>
                <p className="text-silver-300 mt-2">Be the first to create one!</p>
                <Link href="/input" className="inline-block mt-4 btn-silver">
                  Create Photo →
                </Link>
              </div>
            )
          )}

          <div className="text-center space-y-4">
            <Link href="/input" className="btn-silver text-lg px-8 inline-block">
              📸 Create Your Photo
            </Link>
            <p className="text-xs text-silver-500 max-w-lg mx-auto leading-relaxed">
              {GDPR_FOOTER}{' '}
              <Link href="/privacy" className="link-sitecore">
                Privacy notice
              </Link>
            </p>
          </div>
        </div>
      </div>

      <PhotoPreviewModal photo={previewPhoto} onClose={() => setPreviewPhoto(null)} />
    </BoothLayout>
  );
}

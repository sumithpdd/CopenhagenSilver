'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Placeholder gallery data
  const galleryPhotos = [
    {
      id: 1,
      code: 'SILVER1A2B3C4D',
      userName: 'John Doe',
      backgroundId: 'heritage',
      promptTitle: '25 Years Strong',
      imageUrl: '/logo.jpg', // Placeholder
    },
    {
      id: 2,
      code: 'SILVER2E5F6G7H',
      userName: 'Jane Smith',
      backgroundId: 'celebration',
      promptTitle: 'Celebrating Together',
      imageUrl: '/logo.jpg', // Placeholder
    },
  ];

  const filteredPhotos = galleryPhotos.filter((photo) => {
    const matchesSearch =
      photo.code.includes(searchQuery.toUpperCase()) ||
      photo.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || photo.backgroundId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 border-b border-silver-400 border-opacity-20">
        <Link href="/" className="text-2xl font-bold silver-accent hover:text-silver-300 transition">
          ← Sitecore Silver
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 silver-accent">
              Community Gallery
            </h2>
            <p className="text-silver-300">
              Browse all photos from the Sitecore Silver celebration
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by photo code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-black border border-silver-400 rounded text-white placeholder-silver-300 focus:outline-none focus:ring-2 focus:ring-silver-400"
            />
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-silver-600 text-black font-bold rounded hover:bg-silver-500 transition"
            >
              Clear
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'heritage', 'celebration', 'innovation'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded transition ${
                  selectedCategory === category
                    ? 'bg-silver-400 text-black font-bold'
                    : 'silver-bg hover:bg-silver-500'
                }`}
              >
                {category === 'all'
                  ? 'All'
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          {filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-lg silver-bg hover:ring-4 hover:ring-silver-400 transition cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative w-full h-48 bg-black">
                    <img
                      src={photo.imageUrl}
                      alt={photo.code}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60 group-hover:opacity-80 transition" />

                  {/* Info */}
                  <div className="absolute inset-0 flex flex-col justify-end p-3">
                    <p className="text-xs text-silver-200">{photo.code}</p>
                    <p className="font-bold text-white">{photo.userName}</p>
                    <p className="text-xs text-silver-300">{photo.promptTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 silver-bg rounded-lg">
              <p className="text-silver-400 text-lg">No photos found</p>
              <p className="text-silver-300 mt-2">
                Be the first to create one!
              </p>
              <Link
                href="/input"
                className="inline-block mt-4 px-6 py-2 bg-silver-400 text-black font-bold rounded hover:bg-silver-500 transition"
              >
                Create Photo →
              </Link>
            </div>
          )}

          {/* Create Button */}
          <div className="text-center">
            <Link
              href="/input"
              className="inline-block px-8 py-3 bg-silver-400 text-black font-bold rounded hover:bg-silver-500 transition text-lg"
            >
              📸 Create Your Photo
            </Link>
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

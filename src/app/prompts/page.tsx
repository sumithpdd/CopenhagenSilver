'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { prompts, getAllCategories, getPromptsByCategory } from '@/data/prompts';
import { useEffect, useState } from 'react';

export default function PromptsPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((state) => state.session);
  const capturedPhoto = usePhotoBoothStore((state) => state.capturedPhoto);
  const selectedBackground = usePhotoBoothStore((state) => state.selectedBackground);
  const selectedPrompt = usePhotoBoothStore((state) => state.selectedPrompt);
  const setSelectedPrompt = usePhotoBoothStore(
    (state) => state.setSelectedPrompt
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('heritage');
  const categories = getAllCategories();
  const categoryPrompts = getPromptsByCategory(selectedCategory as any);

  // Redirect if no session or background
  useEffect(() => {
    if (!session || !capturedPhoto || !selectedBackground) {
      router.push('/input');
    }
  }, [session, capturedPhoto, selectedBackground, router]);

  const handleSelect = (prompt: typeof prompts[0]) => {
    setSelectedPrompt(prompt);
  };

  const handleContinue = () => {
    if (selectedPrompt) {
      router.push('/processing');
    }
  };

  if (!session || !capturedPhoto || !selectedBackground) return null;

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
                Choose Your Transformation
              </h2>
              <p className="text-silver-300">
                Select an AI prompt to enhance your photo
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded transition ${
                    selectedCategory === category
                      ? 'bg-silver-400 text-black font-bold'
                      : 'silver-bg hover:bg-silver-500'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSelect(prompt)}
                  className={`p-4 rounded-lg transition-all duration-300 ${
                    selectedPrompt?.id === prompt.id
                      ? 'ring-4 ring-silver-400 bg-silver-500 text-black'
                      : 'silver-bg hover:bg-silver-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{prompt.emoji}</div>
                  <h3 className="text-lg font-bold mb-1">{prompt.title}</h3>
                  <p className="text-sm opacity-90">{prompt.description}</p>
                  {selectedPrompt?.id === prompt.id && (
                    <div className="mt-3 text-center">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            {/* Continue Button */}
            {selectedPrompt && (
              <div className="flex justify-center">
                <button
                  onClick={handleContinue}
                  className="px-8 py-3 bg-silver-400 text-black font-bold rounded hover:bg-silver-500 transition text-lg"
                >
                  Create Magic →
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

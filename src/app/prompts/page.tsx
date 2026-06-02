'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { prompts, getAllCategories, getPromptsByCategory } from '@/data/prompts';
import { FormTextarea } from '@/components/ui/FormInput';
import { sanitizePrompt } from '@/lib/prompt-sanitizer';
import { useEffect, useState } from 'react';

const SUGGESTION_PROMPTS = [
  'Transform me into a tech innovator at Sitecore with futuristic effects',
  'Make me appear on stage celebrating 25 years of Sitecore innovation',
  'Create a professional headshot with Sitecore Silver branding',
  'Show me as a creative technologist in a modern workspace',
];

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
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [promptError, setPromptError] = useState<string>('');
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
    setCustomPrompt('');
    setPromptError('');
  };

  const handleCustomPromptChange = (value: string) => {
    setCustomPrompt(value);
    setPromptError('');
  };

  const validateAndContinue = () => {
    if (customPrompt.trim()) {
      // Validate custom prompt
      const result = sanitizePrompt(customPrompt, selectedBackground?.name);
      if (!result.isValid) {
        setPromptError(result.reason || 'Invalid prompt');
        return;
      }
      // Create custom prompt object and set it
      const customPromptObj = {
        id: 'custom',
        title: 'Custom Prompt',
        description: customPrompt.substring(0, 50) + '...',
        emoji: '✨',
        text: result.sanitizedPrompt || customPrompt,
      };
      setSelectedPrompt(customPromptObj as any);
      router.push('/processing');
    } else if (selectedPrompt) {
      router.push('/processing');
    }
  };

  const applyCustomPromptSuggestion = (suggestion: string) => {
    setCustomPrompt(suggestion);
    setPromptError('');
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preset Prompts */}
              <div>
                <h3 className="text-xl font-bold mb-4 silver-accent">
                  Preset Prompts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryPrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handleSelect(prompt)}
                      className={`p-3 rounded-lg transition-all duration-300 text-left ${
                        selectedPrompt?.id === prompt.id && !customPrompt
                          ? 'ring-4 ring-silver-400 bg-silver-500 text-black'
                          : 'silver-bg hover:bg-silver-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{prompt.emoji}</div>
                      <h4 className="text-sm font-bold mb-1">{prompt.title}</h4>
                      <p className="text-xs opacity-90">{prompt.description}</p>
                      {selectedPrompt?.id === prompt.id && !customPrompt && (
                        <div className="mt-2 text-center text-xs">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <h3 className="text-xl font-bold mb-4 silver-accent">
                  Or Create Your Own
                </h3>

                {/* Suggestion Chips */}
                <div className="mb-4 space-y-2">
                  <p className="text-sm text-silver-300 mb-2">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTION_PROMPTS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => applyCustomPromptSuggestion(suggestion)}
                        className="text-xs px-3 py-1 bg-silver-600 hover:bg-silver-500 rounded transition"
                      >
                        {suggestion.substring(0, 25)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt Input */}
                <FormTextarea
                  value={customPrompt}
                  onChange={(e) => handleCustomPromptChange(e.target.value)}
                  placeholder="Describe your vision... (max 2000 characters)"
                  maxLength={2000}
                  className="min-h-[8rem]"
                />

                {/* Character Count */}
                <div className="text-right text-xs text-silver-300 mt-1">
                  {customPrompt.length}/2000
                </div>

                {/* Error Message */}
                {promptError && (
                  <div className="mt-2 p-2 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
                    🚫 {promptError}
                  </div>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={validateAndContinue}
                disabled={!selectedPrompt && !customPrompt.trim()}
                className="btn-silver text-lg px-10"
              >
                Create Magic →
              </button>
            </div>
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

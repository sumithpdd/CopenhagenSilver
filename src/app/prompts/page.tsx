'use client';

import { useRouter } from 'next/navigation';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { prompts, getAllCategories, getPromptsByCategory } from '@/data/prompts';
import { FormTextarea } from '@/components/ui/FormInput';
import { sanitizePrompt } from '@/lib/prompt-sanitizer';
import { BoothLayout } from '@/components/common/BoothLayout';
import { IconArrowRight, IconSparkles } from '@/components/icons/BoothIcons';
import { useEffect, useState } from 'react';

const SUGGESTION_PROMPTS = [
  {
    label: 'Tech innovator',
    text: 'Transform me into a tech innovator at Sitecore with futuristic silver lighting',
  },
  {
    label: 'On stage',
    text: 'Make me appear on stage celebrating 25 years of Sitecore innovation in Copenhagen',
  },
  {
    label: 'Professional headshot',
    text: 'Create a professional headshot with elegant Sitecore Silver event styling',
  },
  {
    label: 'Creative technologist',
    text: 'Show me as a creative technologist in a modern Nordic workspace',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  heritage: 'Heritage',
  celebration: 'Celebration',
  fun: 'Fun',
  innovation: 'Innovation',
};

export default function PromptsPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((state) => state.session);
  const capturedPhoto = usePhotoBoothStore((state) => state.capturedPhoto);
  const selectedBackground = usePhotoBoothStore((state) => state.selectedBackground);
  const selectedPrompt = usePhotoBoothStore((state) => state.selectedPrompt);
  const setSelectedPrompt = usePhotoBoothStore((state) => state.setSelectedPrompt);

  const [selectedCategory, setSelectedCategory] = useState<string>('heritage');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [promptError, setPromptError] = useState<string>('');
  const categories = getAllCategories();
  const categoryPrompts = getPromptsByCategory(selectedCategory as 'heritage');

  const hasCustom = customPrompt.trim().length > 0;
  const canContinue = hasCustom || selectedPrompt;

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
    if (hasCustom) {
      const result = sanitizePrompt(customPrompt, selectedBackground?.name);
      if (!result.isValid) {
        setPromptError(result.reason || 'Invalid prompt');
        return;
      }
      const sanitized = result.sanitizedPrompt || customPrompt;
      setSelectedPrompt({
        id: 'custom',
        title: 'Custom Prompt',
        description: customPrompt.substring(0, 50) + '...',
        fullPrompt: sanitized,
        category: 'custom',
        emoji: '✨',
      });
      router.push('/processing');
    } else if (selectedPrompt) {
      router.push('/processing');
    }
  };

  const applyCustomPromptSuggestion = (text: string) => {
    setCustomPrompt(text);
    setPromptError('');
  };

  if (!session || !capturedPhoto || !selectedBackground) return null;

  const selectionLabel = hasCustom
    ? 'Custom prompt'
    : selectedPrompt?.title ?? 'None selected';

  return (
    <BoothLayout>
      <div className="flex items-center justify-center p-4 py-8 md:py-10">
        <div className="w-full max-w-5xl space-y-6 md:space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-muted">
              Step 4 · AI transformation
            </p>
            <h2 className="page-title silver-accent">Choose Your Transformation</h2>
            <p className="page-subtitle max-w-xl mx-auto">
              Pick a preset or describe your own vision — AI enhances your photo in Copenhagen
              2026 style.
            </p>
            {selectedBackground && (
              <p className="text-sm text-sc-muted">
                Background:{' '}
                <span className="text-silver-300 font-medium">{selectedBackground.name}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`prompt-category-pill ${
                  selectedCategory === category ? 'prompt-category-pill--active' : ''
                }`}
              >
                {CATEGORY_LABELS[category] ?? category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
            <section className="prompt-panel">
              <h3 className="prompt-panel__title">Preset prompts</h3>
              <div className="flex flex-col gap-2.5">
                {categoryPrompts.map((prompt) => {
                  const isSelected =
                    selectedPrompt?.id === prompt.id && !hasCustom;
                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => handleSelect(prompt)}
                      className={`prompt-card ${isSelected ? 'prompt-card--selected' : ''}`}
                    >
                      <span className="prompt-card__emoji" aria-hidden>
                        {prompt.emoji}
                      </span>
                      <span className="prompt-card__body">
                        <span className="prompt-card__title">{prompt.title}</span>
                        <span className="prompt-card__desc">{prompt.description}</span>
                      </span>
                      {isSelected && (
                        <span
                          className="text-sitecore-red text-sm font-bold shrink-0"
                          aria-label="Selected"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="prompt-panel">
              <h3 className="prompt-panel__title">Or create your own</h3>

              <p className="text-sm text-sc-muted mb-3">Quick suggestions — tap to use:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {SUGGESTION_PROMPTS.map((suggestion) => {
                  const isActive = customPrompt.trim() === suggestion.text;
                  return (
                    <button
                      key={suggestion.label}
                      type="button"
                      onClick={() => applyCustomPromptSuggestion(suggestion.text)}
                      className={`prompt-suggestion ${isActive ? 'prompt-suggestion--active' : ''}`}
                      title={suggestion.text}
                    >
                      <span className="font-semibold text-sc-text block text-sm mb-0.5">
                        {suggestion.label}
                      </span>
                      <span className="line-clamp-2">{suggestion.text}</span>
                    </button>
                  );
                })}
              </div>

              <FormTextarea
                value={customPrompt}
                onChange={(e) => handleCustomPromptChange(e.target.value)}
                placeholder="Describe your vision… (max 2000 characters)"
                maxLength={2000}
                className="form-textarea--on-dark min-h-[9rem]"
                aria-label="Custom AI prompt"
              />

              <div className="flex justify-between items-center mt-2 text-xs text-sc-muted">
                <span>Custom prompts override preset selection</span>
                <span>{customPrompt.length}/2000</span>
              </div>

              {promptError && (
                <div
                  className="mt-3 p-3 rounded-lg border border-red-500/40 bg-red-950/40 text-red-200 text-sm"
                  role="alert"
                >
                  {promptError}
                </div>
              )}
            </section>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="prompt-selection-bar">
              <IconSparkles size={16} className="text-accent-muted shrink-0" />
              <span>
                Selected: <strong>{selectionLabel}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={validateAndContinue}
              disabled={!canContinue}
              className="btn-silver text-lg px-10 min-w-[14rem]"
            >
              Create Magic
              <IconArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </BoothLayout>
  );
}

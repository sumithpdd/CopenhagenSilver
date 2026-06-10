/**
 * Client-side compositing API — shared by processing and result (regenerate).
 */

import { apiFetch, refreshApiSession } from '@/lib/core/api-client';
import type { Background, PhotoPrompt } from '@/types';

export function resolvePromptText(prompt: PhotoPrompt): string {
  return (
    prompt.fullPrompt ||
    (prompt as { text?: string }).text ||
    prompt.description ||
    prompt.title
  );
}

export async function fetchCompositedPhoto(options: {
  photo: string;
  background: Background;
  prompt: PhotoPrompt;
}): Promise<string> {
  await refreshApiSession();

  const response = await apiFetch('/api/composit-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      photo: options.photo,
      backgroundDescription: options.background.description,
      prompt: resolvePromptText(options.prompt),
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Enhance API failed: ${response.status} - ${text}`);
  }

  const result = JSON.parse(text) as {
    success?: boolean;
    error?: string;
    data?: { compositedPhoto?: string };
  };

  if (!result.success) {
    throw new Error(result.error || 'Enhancement failed');
  }

  const compositedPhoto = result.data?.compositedPhoto;
  if (!compositedPhoto) {
    throw new Error('No composited photo in response');
  }

  return compositedPhoto;
}

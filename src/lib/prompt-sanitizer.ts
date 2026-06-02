/**
 * Prompt sanitization before Gemini image generation.
 */

import {
  LOGO_MANIPULATION_PATTERNS,
  OFF_THEME_LOCATION_PATTERNS,
  SITECORE_IMAGE_BRAND_RULES,
} from '@/lib/sitecore-brand';

interface SanitizationResult {
  isValid: boolean;
  sanitizedPrompt?: string;
  reason?: string;
  blockedKeywords?: string[];
}

const BLOCKED_KEYWORDS = [
  'nude', 'naked', 'nsfw', 'sex', 'sexual', 'porn', 'pornographic', 'xxx',
  'explicit', 'erotic', 'sensual', 'seductive', 'provocative', 'suggestive',
  'intimate', 'revealing', 'underwear', 'lingerie', 'bikini', 'topless',
  'violent', 'violence', 'blood', 'bloody', 'gore', 'gory', 'kill', 'killing',
  'murder', 'weapon', 'gun', 'knife', 'dead', 'death', 'torture', 'abuse',
  'harm', 'hurt', 'attack', 'assault',
  'racist', 'racism', 'nazi', 'hate', 'slur',
  'drug', 'cocaine', 'heroin', 'meth', 'marijuana', 'weed', 'smoking',
  'drunk', 'alcohol',
  'disturbing', 'horror', 'scary', 'creepy', 'inappropriate', 'offensive',
];

const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+(instructions|prompts)/i,
  /disregard\s+(previous|above|all)/i,
  /forget\s+(previous|above|all)/i,
  /new\s+instructions?:/i,
  /system\s*:/i,
  /admin\s*:/i,
  /override\s+(instructions|prompts)/i,
];

export function sanitizePrompt(
  prompt: string,
  backgroundDescription?: string
): SanitizationResult {
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: false, reason: 'Prompt cannot be empty' };
  }

  if (prompt.length > 2000) {
    return { isValid: false, reason: 'Prompt is too long (max 2000 characters)' };
  }

  const lowerPrompt = prompt.toLowerCase();

  const foundBlockedKeywords = BLOCKED_KEYWORDS.filter((keyword) =>
    lowerPrompt.includes(keyword.toLowerCase())
  );

  if (foundBlockedKeywords.length > 0) {
    return {
      isValid: false,
      reason: 'Prompt contains inappropriate content',
      blockedKeywords: foundBlockedKeywords,
    };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        isValid: false,
        reason: 'Prompt appears to contain instruction manipulation',
      };
    }
  }

  for (const pattern of LOGO_MANIPULATION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        isValid: false,
        reason: 'Prompt cannot modify or replace the official Sitecore logo',
      };
    }
  }

  for (const pattern of OFF_THEME_LOCATION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        isValid: false,
        reason: 'Keep themes in Copenhagen, Denmark for the Silver Celebration',
      };
    }
  }

  let sanitizedPrompt = prompt
    .replace(/[<>]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .trim();

  if (backgroundDescription?.trim()) {
    sanitizedPrompt += ` Theme context: ${backgroundDescription.trim()}.`;
  }

  return {
    isValid: true,
    sanitizedPrompt,
  };
}

/** Full prompt sent to Gemini (user text + mandatory brand rules). */
export function buildGeminiUserPrompt(sanitizedUserPrompt: string): string {
  return `${sanitizedUserPrompt.trim()}\n\n${SITECORE_IMAGE_BRAND_RULES}`;
}

export function isPromptSafe(prompt: string): boolean {
  return sanitizePrompt(prompt).isValid;
}

export function getSafeDefaultPrompt(backgroundDescription?: string): string {
  return buildGeminiUserPrompt(
    `Sitecore Silver 25-year anniversary portrait in Copenhagen, Denmark — celebration at Tivoli${
      backgroundDescription ? `, ${backgroundDescription}` : ''
    }. Elegant Nordic silver event lighting. Do not change the Sitecore logo. Maintain a natural, recognizable likeness.`
  );
}

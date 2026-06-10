import { GoogleGenAI, Modality } from '@google/genai';
import { SITECORE_IMAGE_BRAND_RULES } from '@/lib/sitecore-brand';

/** GA image model; override with GEMINI_IMAGE_MODEL (e.g. gemini-3.1-flash-image). */
export const DEFAULT_GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

const SAFETY_SYSTEM_INSTRUCTION = `You edit photos for the Sitecore Silver 25-year anniversary celebration photo booth in Copenhagen.
Output must be appropriate for all ages: no violence, explicit content, or disturbing imagery.
People must remain fully clothed. Keep faces recognizable.
${SITECORE_IMAGE_BRAND_RULES}`;

export function getGeminiImageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL;
}

/**
 * Edit-style prompt per Gemini image editing docs.
 * @see https://ai.google.dev/gemini-api/docs/image-generation#image-editing
 */
function buildImageEditPrompt(prompt: string, background: string): string {
  const theme = background?.trim()
    ? ` Scene / background direction: ${background}.`
    : '';

  return `Using the provided portrait photo, apply this edit: ${prompt}${theme}

Make the transformation clearly visible (environment, lighting, style, or effects as described).
Preserve the person's face and identity so they remain recognizable. Keep the full head and shoulders visible — do not crop the top of the head.

CRITICAL — output format:
- Vertical PORTRAIT only (taller than wide), aspect ratio 2:3 (100×148 mm postcard).
- The scene MUST fill the entire image edge to edge — no white borders, no empty margins, no letterboxing at top/bottom or sides.
- Extend background, sky, and environment to all four edges of the frame.
- Compose the person in the center with the celebration scene filling the full portrait canvas.

Scenes must feel like the Sitecore Silver Celebration in Copenhagen, Denmark in 2026 (Tivoli / Nordic anniversary event — not other cities).
Do not change, remove, replace, redraw, or be creative with the Sitecore logo or any brand logos. Do not add new logos to the scene.
Do not show calendar years other than 2026 in the image.
Output a new edited portrait image — do not return the original unchanged.

${SITECORE_IMAGE_BRAND_RULES}`;
}

/**
 * Extract generated image from response (last image part = model output).
 */
export function extractImageBase64FromResponse(response: {
  candidates?: Array<{
    content?: { parts?: Array<{ inlineData?: { data?: string } }> };
  }>;
}): string | null {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts?.length) return null;

  let lastImage: string | null = null;
  for (const part of parts) {
    if (part.inlineData?.data) {
      lastImage = part.inlineData.data;
    }
  }
  return lastImage;
}

/** True if decoded buffers are identical (model echoed input). */
export function isSameImageBase64(a: string, b: string): boolean {
  if (a === b) return true;
  try {
    const bufA = Buffer.from(a, 'base64');
    const bufB = Buffer.from(b, 'base64');
    return bufA.length === bufB.length && bufA.equals(bufB);
  } catch {
    return false;
  }
}

/**
 * Image-to-image edit via Gemini native image generation.
 */
export async function generateTransformedImage(
  imageBase64: string,
  prompt: string,
  background: string,
  mimeType: string = 'image/jpeg'
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = getGeminiImageModel();
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model,
    contents: [
      { text: buildImageEditPrompt(prompt, background) },
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
      systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
    },
  });

  const generated = extractImageBase64FromResponse(response);
  if (!generated) {
    return null;
  }

  if (isSameImageBase64(generated, imageBase64)) {
    console.warn('⚠️ [GEMINI] Model returned image identical to input');
    return null;
  }

  return generated;
}

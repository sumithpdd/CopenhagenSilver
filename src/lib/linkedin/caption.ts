import { GoogleGenAI } from '@google/genai';
import { LINKEDIN_HASHTAGS, LINKEDIN_MENTION } from '@/lib/linkedin/constants';

const CAPTION_SYSTEM = `You write a short LinkedIn post (2-4 sentences, max 600 characters) for someone sharing their AI-enhanced photo from the Sitecore Silver 25-year anniversary celebration in Copenhagen.
Tone: professional, enthusiastic, authentic first-person. Mention the event, innovation, community, or digital experience — not salesy.
Do NOT include hashtags or @mentions — those are added automatically.
Do not use quotation marks wrapping the whole post. Return only the post body text.`;

export interface LinkedInCaptionContext {
  userName: string;
  promptTitle?: string;
  backgroundName?: string;
  company?: string;
  companyDescription?: string;
  role?: string;
  headline?: string;
  photoCode?: string;
}

function fallbackCaption(context: LinkedInCaptionContext): string {
  const first = context.userName.split(' ')[0] || 'I';
  return `${first} joined the Sitecore Silver Celebration in Copenhagen — 25 years of innovation, one unforgettable AI photo booth moment. Grateful to be part of this community as we shape the future of digital experience together.`;
}

/** Append required hashtags and @Sitecore mention. */
export function formatLinkedInPost(body: string): string {
  const cleaned = body
    .trim()
    .replace(/#\w+/g, '')
    .replace(/@\w+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `${cleaned}\n\n${LINKEDIN_HASHTAGS}\n\n${LINKEDIN_MENTION}`;
}

export async function generateLinkedInCaption(
  context: LinkedInCaptionContext
): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY?.trim();
  const body = apiKey
    ? await generateWithGemini(apiKey, context)
    : fallbackCaption(context);

  return formatLinkedInPost(body);
}

async function generateWithGemini(
  apiKey: string,
  context: LinkedInCaptionContext
): Promise<string> {
  const model = process.env.GEMINI_QUOTE_MODEL?.trim() || 'gemini-2.5-flash';
  const bits = [
    `Name: ${context.userName}`,
    context.company && `Company: ${context.company}`,
    context.companyDescription && `About company: ${context.companyDescription}`,
    context.role && `Role: ${context.role}`,
    context.headline && `LinkedIn headline: ${context.headline}`,
    context.promptTitle && `AI transformation: ${context.promptTitle}`,
    context.backgroundName && `Background: ${context.backgroundName}`,
    context.photoCode && `Photo code: ${context.photoCode}`,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `Event: Sitecore Silver — 25 Years of Innovation, Copenhagen (Tivoli).

Attendee sharing their AI-enhanced celebration photo on LinkedIn:
${bits}

Write the LinkedIn post body (first person).`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: [{ text: prompt }],
      config: { systemInstruction: CAPTION_SYSTEM },
    });

    const text =
      response.text?.trim() ??
      response.candidates?.[0]?.content?.parts
        ?.map((p) => ('text' in p ? p.text : ''))
        .join('')
        .trim();

    if (text && text.length > 20) {
      return text.replace(/^["']|["']$/g, '').slice(0, 700);
    }
  } catch (error) {
    console.warn('[linkedin-caption] Gemini failed, using fallback:', error);
  }

  return fallbackCaption(context);
}

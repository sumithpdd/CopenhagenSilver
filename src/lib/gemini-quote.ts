import { GoogleGenAI } from '@google/genai';

const DEFAULT_QUOTE_MODEL = 'gemini-2.5-flash';

const QUOTE_SYSTEM = `You write one inspirational quote (1-2 sentences, max 220 characters) for a Sitecore Silver 25-year anniversary celebration attendee profile in Copenhagen.
Tone: professional, warm, forward-looking — about unified platforms, orchestrating outcomes, innovation, and community.
Do not use hashtags or quotation marks around the whole quote. Write SitecoreAI as one word when relevant.
Return only the quote text, nothing else.`;

export interface QuoteContext {
  fullName: string;
  company?: string;
  role?: string;
  headline?: string;
  photoCode: string;
}

export async function generateAttendeeAiQuote(
  context: QuoteContext
): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return fallbackQuote(context);
  }

  const model = process.env.GEMINI_QUOTE_MODEL?.trim() || DEFAULT_QUOTE_MODEL;
  const profileBits = [
    context.fullName && `Name: ${context.fullName}`,
    context.company && `Company: ${context.company}`,
    context.role && `Role: ${context.role}`,
    context.headline && `Headline: ${context.headline}`,
    `Photo code: ${context.photoCode}`,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `Event: Sitecore Silver — 25 Years of Innovation, Copenhagen celebration at Tivoli.

Attendee:
${profileBits}

Write a unique AIQuote for their attendee profile page.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: [{ text: prompt }],
      config: { systemInstruction: QUOTE_SYSTEM },
    });

    const text =
      response.text?.trim() ??
      response.candidates?.[0]?.content?.parts
        ?.map((p) => ('text' in p ? p.text : ''))
        .join('')
        .trim();
    if (text && text.length > 10) {
      return text.replace(/^["']|["']$/g, '').slice(0, 280);
    }
  } catch (error) {
    console.warn('[gemini-quote] Generation failed, using fallback:', error);
  }

  return fallbackQuote(context);
}

function fallbackQuote(context: QuoteContext): string {
  const name = context.fullName.split(' ')[0] || 'everyone';
  return `When every capability in the stack speaks the same language, teams stop juggling tools and start orchestrating outcomes — ${name}, that is the promise we are celebrating in Copenhagen.`;
}

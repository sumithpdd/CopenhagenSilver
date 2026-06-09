import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';
import { resolveAppConfig } from '@/lib/core/app-config';
import { requireApiAuth } from '@/lib/core/api-auth';
import { sanitizePrompt } from '@/lib/prompt-sanitizer';
import {
  generateTransformedImage,
  getGeminiImageModel,
} from '@/lib/gemini-image';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mimeTypeFromDataUrl(photo: string): string {
  const match = photo.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  return match?.[1] ?? 'image/jpeg';
}

/**
 * Process image with Gemini native image generation (@google/genai).
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 */
interface ProcessingContext {
  watermarkText: string;
  eventTagline: string;
  logoPath: string;
}

async function processWithGemini(
  imageBase64: string,
  prompt: string,
  background: string,
  mimeType: string,
  ctx: ProcessingContext
): Promise<string> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn('⚠️ Gemini API key not configured, using fallback enhancement');
      return enhanceImageWithSharp(
        imageBase64,
        prompt,
        background,
        ctx.watermarkText,
        ctx.eventTagline
      );
    }

    const model = getGeminiImageModel();
    console.log('🔑 [GEMINI] Calling native image generation');
    console.log('📝 [GEMINI] Model:', model);
    console.log('📝 [GEMINI] Prompt:', prompt.substring(0, 60) + '...');

    const base64Data = await generateTransformedImage(
      imageBase64,
      prompt,
      background,
      mimeType
    );

    if (!base64Data) {
      console.warn('⚠️ [GEMINI] No image in response — falling back to Sharp');
      return enhanceImageWithSharp(
        imageBase64,
        prompt,
        background,
        ctx.watermarkText,
        ctx.eventTagline
      );
    }

    console.log(
      '✅ [GEMINI] Successfully generated image',
      `(output ~${Math.round(base64Data.length * 0.75 / 1024)}KB)`
    );
    return base64Data;
  } catch (error) {
    console.error('❌ [GEMINI] Error:', error);
    console.warn('⚠️ Falling back to Sharp enhancement');
    return enhanceImageWithSharp(
      imageBase64,
      prompt,
      background,
      ctx.watermarkText,
      ctx.eventTagline
    );
  }
}

/**
 * Fallback: Apply theme-based image transformation with Sharp
 */
async function enhanceImageWithSharp(
  imageBase64: string,
  prompt: string,
  background: string,
  watermarkText: string,
  eventTagline: string
): Promise<string> {
  try {
    console.log('🎨 [SHARP] Starting fallback enhancement');

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 800;
    console.log('✅ [SHARP] Image dimensions:', width, 'x', height);

    // Apply theme-based effects with stronger transformations
    let enhanced = sharp(imageBuffer);
    const promptLower = prompt.toLowerCase();
    const bgLower = background.toLowerCase();

    // Heritage theme: Vintage/sepia effect
    if (promptLower.includes('heritage') || promptLower.includes('vintage') || promptLower.includes('history') || bgLower.includes('heritage')) {
      console.log('🎨 [SHARP] Applying HERITAGE effect');
      enhanced = enhanced
        .modulate({ brightness: 1.15, saturation: 0.4, hue: 20 })
        .blur(0.4)
        .sharpen();
    }
    // Innovation theme: High saturation/vibrant effect
    else if (promptLower.includes('innovation') || promptLower.includes('future') || promptLower.includes('tech') || bgLower.includes('innovation')) {
      console.log('🎨 [SHARP] Applying INNOVATION effect');
      enhanced = enhanced
        .modulate({ brightness: 1.1, saturation: 1.5 })
        .sharpen({ sigma: 2 });
    }
    // Celebration theme: Bright and very colorful
    else if (promptLower.includes('celebrat') || promptLower.includes('joyful') || promptLower.includes('years') || bgLower.includes('celebration')) {
      console.log('🎨 [SHARP] Applying CELEBRATION effect');
      enhanced = enhanced
        .modulate({ brightness: 1.2, saturation: 1.5 })
        .sharpen({ sigma: 1.5 });
    }
    // Default: Balanced enhancement
    else {
      console.log('🎨 [SHARP] Applying DEFAULT enhancement');
      enhanced = enhanced.modulate({
        brightness: 1.1,
        saturation: 1.2,
      }).sharpen();
    }

    // Create text banner
    const promptText = prompt.substring(0, 60);
    const textBanner = await sharp({
      create: {
        width: width,
        height: 140,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(`
            <svg width="${width}" height="140" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:rgba(0,0,0,0.8);stop-opacity:1" />
                  <stop offset="100%" style="stop-color:rgba(0,0,0,0.4);stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="${width}" height="140" fill="url(#bgGrad)"/>
              <text x="30" y="60" font-family="Arial,sans-serif" font-size="36" font-weight="bold" fill="white">${watermarkText}</text>
              <text x="30" y="90" font-family="Arial,sans-serif" font-size="14" fill="#C0C0C0">${promptText}</text>
              <text x="30" y="120" font-family="Arial,sans-serif" font-size="12" fill="#A0A0A0">${eventTagline}</text>
            </svg>
          `),
          top: height - 140,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // Composite image with banner
    const result = await enhanced
      .composite([
        {
          input: textBanner,
          top: height - 140,
          left: 0,
        },
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    console.log('✅ [SHARP] Final image size:', result.length);
    const base64Result = result.toString('base64');
    console.log('✅ [SHARP] Enhancement complete');

    return base64Result;
  } catch (error) {
    console.error('❌ [SHARP] Enhancement error:', error);
    throw error;
  }
}

/**
 * Add logo to image corner
 */
async function addLogoToImage(
  imageBuffer: Buffer,
  logoPath: string
): Promise<Buffer> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 800;

    const resolvedLogo = path.join(
      process.cwd(),
      'public',
      logoPath.replace(/^\//, '')
    );
    const logoSize = Math.round(Math.min(width, height) * 0.14);
    const padding = Math.round(logoSize * 0.35);

    const logo = await sharp(resolvedLogo)
      .resize(logoSize, logoSize, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer();

    return await sharp(imageBuffer)
      .composite([
        {
          input: logo,
          top: padding,
          left: padding,
        },
      ])
      .jpeg({ quality: 95 })
      .toBuffer();
  } catch (error) {
    console.warn('⚠️ Failed to add logo:', error);
    return imageBuffer;
  }
}

export async function POST(request: NextRequest) {
  const auth = requireApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    console.log('🔗 [API] /api/composit-image called');

    const appConfig = resolveAppConfig();
    const branding = appConfig.branding;
    const ctx: ProcessingContext = {
      watermarkText: branding.watermarkText,
      eventTagline: `${branding.eventSubtitle}${branding.eventDate ? ` • ${branding.eventDate}` : ''}`,
      logoPath: branding.logoPath,
    };

    const body = await request.json();
    console.log('📥 [API] Body keys:', Object.keys(body));

    const { photo, backgroundDescription, prompt } = body;

    console.log('✅ [API] Photo:', photo ? `${photo.substring(0, 50)}...` : 'MISSING');
    console.log('✅ [API] Prompt:', prompt || 'MISSING');
    console.log('✅ [API] Background:', backgroundDescription || 'NONE');

    if (!photo || !prompt) {
      console.error('❌ [API] Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields: photo and prompt' },
        { status: 400 }
      );
    }

    // Sanitize prompt
    console.log('🛡️ [API] Sanitizing prompt...');
    const sanitizationResult = sanitizePrompt(prompt, backgroundDescription);
    if (!sanitizationResult.isValid) {
      console.warn('❌ [API] Prompt validation failed:', sanitizationResult.reason);
      return NextResponse.json(
        { success: false, error: `Prompt validation failed: ${sanitizationResult.reason}` },
        { status: 400 }
      );
    }
    const finalPrompt = sanitizationResult.sanitizedPrompt || prompt;

    const mimeType = mimeTypeFromDataUrl(photo);
    const photoBase64 =
      photo.includes(',') && photo.startsWith('data:image')
        ? photo.split(',')[1]
        : photo;

    console.log('⚙️ [API] Processing with Gemini...');
    const compositedBase64 = await processWithGemini(
      photoBase64,
      finalPrompt,
      backgroundDescription ?? '',
      mimeType,
      ctx
    );

    // Convert base64 to buffer and add logo
    console.log('🎨 [API] Adding logo overlay...');
    const imageBuffer = Buffer.from(compositedBase64, 'base64');
    const imageWithLogo = await addLogoToImage(imageBuffer, ctx.logoPath);
    const finalBase64WithLogo = imageWithLogo.toString('base64');

    // Ensure base64 is properly formatted
    const finalBase64 = finalBase64WithLogo.includes('data:')
      ? finalBase64WithLogo
      : `data:image/jpeg;base64,${finalBase64WithLogo}`;

    console.log('✅ [API] Processing complete! Response size:', finalBase64.length);

    return NextResponse.json({
      success: true,
      data: {
        compositedPhoto: finalBase64,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error in composit-image:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to process image: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

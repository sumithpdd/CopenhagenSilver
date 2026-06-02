import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

/**
 * Process image with Gemini API for AI transformation
 */
async function processWithGemini(imageBase64: string, prompt: string, background: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Gemini API key not configured, using fallback enhancement');
      return enhanceImageWithSharp(imageBase64, prompt, background);
    }

    console.log('🔑 [GEMINI] Initializing Gemini API');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build full prompt
    const systemPrompt = 'You are an expert image transformer. Apply creative enhancements to the photo based on the prompt while keeping the person recognizable.';
    const fullPrompt = background && background.trim()
      ? `${prompt}\n\nBackground theme: ${background}\n\n${systemPrompt}`
      : `${prompt}\n\n${systemPrompt}`;

    console.log('📝 [GEMINI] Sending to Gemini model');
    console.log('📝 [GEMINI] Prompt:', prompt);

    // Call Gemini API
    const result = await model.generateContent([
      fullPrompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    // Extract image from response
    let base64Data: string | null = null;

    if (result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if ((part as any).inlineData && (part as any).inlineData.data) {
            base64Data = (part as any).inlineData.data;
            console.log('✅ [GEMINI] Image data received from Gemini');
            break;
          }
        }
      }
    }

    if (!base64Data) {
      console.warn('⚠️ [GEMINI] No image in response, using fallback');
      return enhanceImageWithSharp(imageBase64, prompt, background);
    }

    return base64Data;
  } catch (error) {
    console.error('❌ [GEMINI] Error:', error);
    console.warn('⚠️ Falling back to Sharp enhancement');
    return enhanceImageWithSharp(imageBase64, prompt, background);
  }
}

/**
 * Fallback: Apply theme-based image transformation with Sharp
 */
async function enhanceImageWithSharp(imageBase64: string, prompt: string, background: string): Promise<string> {
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
    if (promptLower.includes('heritage') || promptLower.includes('vintage') || bgLower.includes('heritage')) {
      console.log('🎨 [SHARP] Applying HERITAGE effect');
      enhanced = enhanced
        .modulate({ brightness: 1.1, saturation: 0.5, hue: 15 })
        .blur(0.3);
    }
    // Innovation theme: High contrast effect
    else if (promptLower.includes('innovation') || promptLower.includes('future') || bgLower.includes('innovation')) {
      console.log('🎨 [SHARP] Applying INNOVATION effect');
      enhanced = enhanced
        .modulate({ brightness: 1.05, saturation: 1.4, contrast: 1.2 })
        .sharpen({ sigma: 1.5 });
    }
    // Celebration theme: Bright and colorful
    else if (promptLower.includes('celebration') || promptLower.includes('joyful') || bgLower.includes('celebration')) {
      console.log('🎨 [SHARP] Applying CELEBRATION effect');
      enhanced = enhanced
        .modulate({ brightness: 1.15, saturation: 1.3, contrast: 1.1 })
        .sharpen();
    }
    // Default: Balanced enhancement
    else {
      console.log('🎨 [SHARP] Applying DEFAULT enhancement');
      enhanced = enhanced.modulate({
        brightness: 1.08,
        saturation: 1.1,
        contrast: 1.05,
      });
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
              <text x="30" y="60" font-family="Arial,sans-serif" font-size="36" font-weight="bold" fill="white">SITECORE SILVER</text>
              <text x="30" y="90" font-family="Arial,sans-serif" font-size="14" fill="#C0C0C0">${promptText}</text>
              <text x="30" y="120" font-family="Arial,sans-serif" font-size="12" fill="#A0A0A0">25 Years of Innovation • Copenhagen 2026</text>
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
 * Add Sitecore branding to enhanced image
 */
async function addBranding(imageBuffer: Buffer, prompt: string): Promise<Buffer> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 800;

    const promptText = prompt.substring(0, 60);
    const banner = await sharp({
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
              <text x="30" y="60" font-family="Arial,sans-serif" font-size="36" font-weight="bold" fill="white">SITECORE SILVER</text>
              <text x="30" y="90" font-family="Arial,sans-serif" font-size="14" fill="#C0C0C0">${promptText}</text>
              <text x="30" y="120" font-family="Arial,sans-serif" font-size="12" fill="#A0A0A0">25 Years of Innovation • Copenhagen 2026</text>
            </svg>
          `),
          top: height - 140,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    return await sharp(imageBuffer)
      .composite([
        {
          input: banner,
          top: height - 140,
          left: 0,
        },
      ])
      .jpeg({ quality: 95 })
      .toBuffer();
  } catch (error) {
    console.warn('⚠️ Failed to add branding:', error);
    return imageBuffer;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 [API] /api/composit-image called');

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

    // Extract base64 from data URL if needed
    const photoBase64 =
      photo.includes(',') && photo.startsWith('data:image')
        ? photo.split(',')[1]
        : photo;

    console.log('⚙️ [API] Processing with Gemini...');
    const compositedBase64 = await processWithGemini(photoBase64, prompt, backgroundDescription);

    // Ensure base64 is properly formatted
    const finalBase64 = compositedBase64.includes('data:')
      ? compositedBase64
      : `data:image/jpeg;base64,${compositedBase64}`;

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

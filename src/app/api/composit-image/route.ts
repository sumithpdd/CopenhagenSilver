import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

/**
 * Add Sitecore logo and theme effects to image
 */
async function enhanceImage(imageBase64: string, prompt: string, background: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 800;

    // Apply theme-based effects
    let enhanced = sharp(imageBuffer);

    // Apply effects based on prompt theme
    if (prompt.toLowerCase().includes('heritage') || background.toLowerCase().includes('heritage')) {
      // Add sepia/vintage effect
      enhanced = enhanced.modulate({
        brightness: 1.05,
        saturation: 0.8,
      });
    } else if (prompt.toLowerCase().includes('innovation') || background.toLowerCase().includes('innovation')) {
      // Enhance colors for tech vibe
      enhanced = enhanced.modulate({
        brightness: 1.02,
        saturation: 1.15,
      });
    } else if (prompt.toLowerCase().includes('celebration') || background.toLowerCase().includes('celebration')) {
      // Bright, vibrant effect
      enhanced = enhanced.modulate({
        brightness: 1.08,
        saturation: 1.2,
      });
    }

    // Create a subtle silver overlay
    const overlaySize = 100;
    const silverOverlay = await sharp({
      create: {
        width: overlaySize,
        height: overlaySize,
        channels: 4,
        background: { r: 192, g: 192, b: 192, alpha: 0.1 }, // Silver with transparency
      },
    })
      .png()
      .toBuffer();

    // Create text banner with Sitecore branding
    const textBanner = await sharp({
      create: {
        width: width,
        height: 120,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(`
            <svg width="${width}" height="120" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:rgba(0,0,0,0.7);stop-opacity:1" />
                  <stop offset="100%" style="stop-color:rgba(0,0,0,0.3);stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="${width}" height="120" fill="url(#bgGrad)"/>
              <text x="30" y="70" font-family="Arial,sans-serif" font-size="48" font-weight="bold" fill="white">SITECORE SILVER</text>
              <text x="30" y="105" font-family="Arial,sans-serif" font-size="18" fill="#C0C0C0">25 Years of Innovation • June 11, 2026</text>
            </svg>
          `),
          top: height - 120,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // Composite the enhanced image with banner
    const result = await enhanced
      .composite([
        {
          input: textBanner,
          top: height - 120,
          left: 0,
        },
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    return result.toString('base64');
  } catch (error) {
    console.error('❌ Enhancement error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { photo, backgroundDescription, prompt, background } = await request.json();

    if (!photo || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: photo and prompt' },
        { status: 400 }
      );
    }

    console.log('🎨 Starting image enhancement...');

    // Extract base64 from data URL if needed
    const photoBase64 =
      photo.includes(',') && photo.startsWith('data:image')
        ? photo.split(',')[1]
        : photo;

    console.log('📝 Prompt:', prompt);
    console.log('🎭 Background:', backgroundDescription);

    // Enhance the image with Sharp effects and text overlay
    console.log('⚙️ Applying enhancements...');
    const enhancedBase64 = await enhanceImage(photoBase64, prompt, backgroundDescription);

    // Ensure base64 is properly formatted
    const finalBase64 = enhancedBase64.includes('data:')
      ? enhancedBase64
      : `data:image/jpeg;base64,${enhancedBase64}`;

    console.log('✅ Enhancement completed!');

    // Return the result
    return NextResponse.json({
      success: true,
      data: {
        compositedPhoto: finalBase64,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error processing image:', error);

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

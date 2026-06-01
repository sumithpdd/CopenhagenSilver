import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

/**
 * Add Sitecore logo to image
 */
async function addLogoToImage(imageBase64: string): Promise<string> {
  try {
    // Create a simple SVG logo (Sitecore Silver branding)
    const logoSvg = `
      <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <rect width="200" height="80" fill="rgba(0,0,0,0.4)" rx="8"/>
        <circle cx="25" cy="40" r="15" fill="none" stroke="white" stroke-width="2" filter="url(#shadow)"/>
        <circle cx="25" cy="40" r="10" fill="none" stroke="white" stroke-width="1"/>
        <text x="45" y="48" font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="white" filter="url(#shadow)">SITECORE</text>
        <text x="45" y="62" font-family="Arial,sans-serif" font-size="10" fill="silver">25 Years</text>
      </svg>
    `;

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Create SVG buffer
    const logoBuffer = Buffer.from(logoSvg);

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 800;

    // Resize logo proportionally to image size
    const logoWidth = Math.round(width * 0.15); // 15% of image width
    const logoHeight = Math.round((80 / 200) * logoWidth); // Maintain aspect ratio

    const resizedLogoBuffer = await sharp(logoBuffer)
      .resize(logoWidth, logoHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Composite logo on image (bottom right corner with padding)
    const padding = Math.round(width * 0.02); // 2% padding
    const logoX = width - logoWidth - padding;
    const logoY = height - logoHeight - padding;

    const imageWithLogo = await sharp(imageBuffer)
      .composite([
        {
          input: resizedLogoBuffer,
          left: logoX,
          top: logoY,
        },
      ])
      .toBuffer();

    return imageWithLogo.toString('base64');
  } catch (error) {
    console.warn('⚠️ Could not add logo:', error);
    // Return original image if logo addition fails
    return imageBase64;
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

    console.log('🎨 Starting image compositing with Gemini API...');

    // Extract base64 from data URL if needed
    const photoBase64 =
      photo.includes(',') && photo.startsWith('data:image')
        ? photo.split(',')[1]
        : photo;

    // Extract background base64 if provided
    let backgroundBase64 = null;
    if (background) {
      backgroundBase64 = background.includes(',') && background.startsWith('data:image')
        ? background.split(',')[1]
        : background;
    }

    // Build the prompt with background context
    const fullPrompt = backgroundDescription && backgroundDescription.trim()
      ? `${prompt}\n\nBackground theme: ${backgroundDescription}`
      : prompt;

    console.log('📝 Prompt:', fullPrompt);

    // Call Gemini API with image
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    // Build the request with proper image handling
    const systemPrompt = 'You are an expert image editor. Process the user\'s photo with creative enhancements while keeping the person recognizable. Return only the edited image.';
    const requestContent: any[] = [`${systemPrompt}\n\n${fullPrompt}`];

    // Add user photo
    requestContent.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: photoBase64,
      },
    });

    // Add background image if provided
    if (backgroundBase64) {
      requestContent.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: backgroundBase64,
        },
      });
    }

    console.log('🔄 Calling Gemini API...');

    // Call Gemini API
    const result = await model.generateContent(requestContent);

    // Extract the image from response
    const response = result.response;
    let base64Data: string | null = null;

    // Try to get image data from response
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Data = part.inlineData.data;
            console.log('✅ Image data extracted from Gemini response');
            break;
          }
        }
      }
    }

    // If no image in response, try text (sometimes Gemini returns base64 as text)
    if (!base64Data) {
      const text = response.text();
      console.log('📄 Response text:', text.substring(0, 100));

      // If response is base64, use it directly
      if (text && !text.includes('unable') && !text.includes('error') && text.length > 100) {
        // Check if it looks like base64
        if (/^[A-Za-z0-9+/=]+$/.test(text.substring(0, 50))) {
          base64Data = text;
          console.log('✅ Base64 data extracted from response text');
        }
      }
    }

    if (!base64Data) {
      console.error('❌ No image data in Gemini response');
      console.error('Full response:', JSON.stringify(response));
      throw new Error('Gemini API did not return image data. The API may have rate limits or quota issues.');
    }

    console.log('✨ Image compositing successful!');

    // Add Sitecore logo to the image
    console.log('🎨 Adding Sitecore logo...');
    const logoBase64 = await addLogoToImage(base64Data);

    // Ensure base64 is properly formatted
    const finalBase64 = logoBase64.includes('data:')
      ? logoBase64
      : `data:image/jpeg;base64,${logoBase64}`;

    console.log('✅ Logo added successfully!');

    // Return the result
    return NextResponse.json({
      success: true,
      data: {
        compositedPhoto: finalBase64,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error compositing image:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to composit image: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

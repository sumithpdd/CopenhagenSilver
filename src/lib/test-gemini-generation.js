/**
 * Manual test for Gemini native image generation
 * Run with: node src/lib/test-gemini-generation.js
 *
 * Requires GOOGLE_GEMINI_API_KEY in environment (.env.local values exported in shell).
 * Place test-image.jpg in project root.
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenAI, Modality } = require('@google/genai');

const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

async function testGeminiImageGeneration() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GOOGLE_GEMINI_API_KEY not set in environment');
    process.exit(1);
  }

  console.log('🚀 Testing Gemini image generation');
  console.log('   Model:', MODEL);
  console.log('━'.repeat(60));

  const imagePath = path.join(__dirname, '../../test-image.jpg');
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Test image not found at: ${imagePath}`);
    process.exit(1);
  }

  const imageBase64 = fs.readFileSync(imagePath).toString('base64');
  const ai = new GoogleGenAI({ apiKey });

  const prompt =
    'Transform this person for a Sitecore 25-year celebration photo booth. ' +
    'Keep them recognizable, professional, and celebratory.';

  console.log('⏳ Calling generateContent...');
  const start = Date.now();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { text: prompt },
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
    ],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  console.log(`✅ Response in ${Date.now() - start}ms`);

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  let generatedBase64 = null;

  for (const part of parts) {
    if (part.text) {
      console.log('📝 Text:', part.text.slice(0, 120) + '...');
    }
    if (part.inlineData?.data) {
      generatedBase64 = part.inlineData.data;
      console.log('🎨 Image part:', part.inlineData.data.length, 'chars base64');
    }
  }

  if (!generatedBase64) {
    console.error('❌ No image in response');
    process.exit(1);
  }

  const outputPath = path.join(__dirname, '../../output-image.jpg');
  fs.writeFileSync(outputPath, Buffer.from(generatedBase64, 'base64'));
  console.log('💾 Saved:', outputPath);
}

testGeminiImageGeneration().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});

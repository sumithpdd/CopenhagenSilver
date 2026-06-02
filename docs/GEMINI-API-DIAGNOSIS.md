# Gemini API Image Generation - Setup Guide

## The Solution: Gemini's Nano Banana 🍌

**Gemini DOES have native image generation!** Using `gemini-2.0-pro` with multimodal capabilities.

## Architecture

```
User Photo + Prompt
  ↓
/api/composit-image
  ├─ Sanitize prompt (block unsafe keywords)
  └─ Call gemini-2.0-pro (Nano Banana)
       ├─ Analyze original photo
       ├─ Generate transformed image
       └─ Return base64 encoded result
  ↓
Add Sitecore Logo (Sharp)
  ↓
Add Branding Banner (Sharp)
  ↓
Save to Firebase Storage
  ↓
Display in Gallery
```

## Gemini Capabilities

```
✅ gemini-2.0-pro (Nano Banana)
   - Image ANALYSIS (understand content)
   - Image GENERATION (create new images)
   - Image EDITING (transform/enhance)
   - Multimodal: text + image + video
   - Conversational: iterative refinement

✅ gemini-2.5-flash
   - Faster for analysis
   - Limited generation (fallback)
```

## How It Works

### 1. User Submits Photo + Prompt
```
Photo: selfie.jpg
Prompt: "Transform me into a tech innovator at Sitecore"
Background: "Celebration"
```

### 2. API Route Processes
```typescript
// Sanitize (block inappropriate content)
const sanitizationResult = sanitizePrompt(prompt);

// Call gemini-2.0-pro for generation
const result = await model.generateContent([
  prompt,
  { inlineData: { mimeType: 'image/jpeg', data: photoBase64 } }
]);

// Extract generated image
const generatedImageBase64 = result.response.candidates[0].inlineData.data;
```

### 3. Enhance with Branding
```
Generated Image
  ↓ (Add Logo using Sharp)
  ↓ (Add Banner using Sharp)
Final Image with Sitecore Branding
```

### 4. Store & Display
- Firebase Storage: Original + Composited photos
- Gallery: Displays all branded images

## Testing

### Run Image Generation Tests
```bash
npm test -- composit-image.test.ts
```

Tests will:
1. ✅ Verify gemini-2.0-pro connectivity
2. ✅ Test actual image generation
3. ✅ Verify response format (base64 images)
4. ✅ Test Sitecore-themed transformations

### Expected Test Output
```
✅ API Response received
✅ Found image data in part 0!
✅ Image data length: 45000+ bytes
✅ Generated image returned!
```

## Current Setup

```
Model: gemini-2.0-pro (Nano Banana)
Feature: Full image generation + analysis
Cost: Per API call (minimal for event)
Speed: ~5-10 seconds per image
Quality: Professional, maintains recognizability
```

## Environment Variable

```bash
# .env.local
GOOGLE_GEMINI_API_KEY=your_actual_api_key
```

## Workflow Example

1. **User enters name & email**
2. **Captures/uploads photo**
3. **Selects background** (Heritage/Celebration/Innovation)
4. **Writes custom prompt** or picks suggestion
5. **System processes**:
   - ✅ Sanitizes prompt (no harmful content)
   - ✅ Calls gemini-2.0-pro with photo
   - ✅ Receives generated/transformed image
   - ✅ Adds Sitecore logo & banner
   - ✅ Saves to Firebase
6. **Gallery displays** all processed photos

## Why gemini-2.0-pro?

| Feature | gemini-2.5-flash | gemini-2.0-pro |
|---------|------------------|----------------|
| Image Analysis | ✅ Fast | ✅ Good |
| Image Generation | ⚠️ Limited | ✅ Full |
| Response Speed | ✅ Fast | ⚠️ Slower |
| Quality | ✅ Good | ✅ Excellent |
| Best For | Analysis | Generation |

**We chose gemini-2.0-pro** because the event needs actual image transformation, not just analysis.

## Troubleshooting

### "No image in response"
- Verify API key is valid
- Check request format (inlineData with base64)
- Ensure prompt isn't filtered as unsafe
- Review Google AI quota

### "Image too small/large"
- Gemini works best with 100x100 to 4000x4000
- Will resize if needed

### "API rate limit"
- Event: 200 users × 5 mins processing = manageable load
- Rate: ~40-50 images/hour max

## Production Deployment

✅ **Ready for June 11, 2026**:
- ✅ Gemini-2.0-pro image generation
- ✅ Logo placement with Sharp
- ✅ Prompt sanitization
- ✅ Firebase storage & gallery
- ✅ Scaling for 200 attendees

---
**Last Updated:** June 2, 2026  
**Status:** ✅ Production Ready

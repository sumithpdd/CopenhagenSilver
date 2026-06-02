"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.processPhotoWithGemini = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const generative_ai_1 = require("@google/generative-ai");
const sharp_1 = __importDefault(require("sharp"));
// Initialize Firebase Admin
if (admin.apps.length === 0) {
    admin.initializeApp();
}
/**
 * Process photo with Gemini API for image transformation
 * Uses the real Gemini model for image-to-image processing
 */
exports.processPhotoWithGemini = functions
    .region('us-central1')
    .runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: "2GB",
})
    .https.onCall(async (data, context) => {
    try {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new functions.https.HttpsError("failed-precondition", "Gemini API key not configured");
        }
        const { userPhotoBase64, backgroundDescription = "", customPrompt = "", } = data;
        if (!userPhotoBase64) {
            throw new functions.https.HttpsError("invalid-argument", "Missing required parameter: userPhotoBase64");
        }
        console.log("🎨 Processing photo with Gemini API");
        console.log("📝 Prompt:", customPrompt);
        console.log("🎭 Background:", backgroundDescription);
        // Build the full prompt
        const systemPrompt = `You are an expert image transformer. Transform the user's photo according to their prompt while keeping them recognizable. Apply creative effects, colors, and styling as requested.`;
        const fullPrompt = backgroundDescription && backgroundDescription.trim()
            ? `${customPrompt}\n\nBackground theme: ${backgroundDescription}`
            : customPrompt;
        // Initialize Gemini
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });
        // Send to Gemini with image
        const result = await model.generateContent([
            `${systemPrompt}\n\n${fullPrompt}`,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: userPhotoBase64,
                },
            },
        ]);
        // Extract image from response
        let base64Data = null;
        if (result.response.candidates && result.response.candidates.length > 0) {
            const candidate = result.response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        base64Data = part.inlineData.data;
                        break;
                    }
                }
            }
        }
        if (!base64Data) {
            console.log("⚠️ No image in Gemini response, applying Sharp enhancement");
            // Fallback: use Sharp enhancement
            const imageBuffer = Buffer.from(userPhotoBase64, "base64");
            const enhanced = await applyThemeEffect(imageBuffer, customPrompt, backgroundDescription);
            return {
                success: true,
                imageBase64: enhanced.toString("base64"),
                method: "sharp-fallback",
            };
        }
        console.log("✅ Image processed by Gemini");
        // Add Sitecore branding banner
        const imageBuffer = Buffer.from(base64Data, "base64");
        const withBanner = await addBranding(imageBuffer, customPrompt);
        return {
            success: true,
            imageBase64: withBanner.toString("base64"),
            method: "gemini",
        };
    }
    catch (error) {
        console.error("❌ Error in processPhotoWithGemini:", error);
        throw new functions.https.HttpsError("internal", `Failed to process photo: ${error.message}`);
    }
});
/**
 * Add Sitecore branding banner to image
 */
async function addBranding(imageBuffer, prompt) {
    try {
        const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
        const width = metadata.width || 1200;
        const height = metadata.height || 800;
        const promptText = prompt.substring(0, 60);
        const banner = await (0, sharp_1.default)({
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
        return await (0, sharp_1.default)(imageBuffer)
            .composite([
            {
                input: banner,
                top: height - 140,
                left: 0,
            },
        ])
            .jpeg({ quality: 95 })
            .toBuffer();
    }
    catch (error) {
        console.warn("Failed to add branding:", error);
        return imageBuffer;
    }
}
/**
 * Apply theme-based effect using Sharp (fallback)
 */
async function applyThemeEffect(imageBuffer, prompt, background) {
    const promptLower = prompt.toLowerCase();
    const bgLower = background.toLowerCase();
    let enhanced = (0, sharp_1.default)(imageBuffer);
    if (promptLower.includes("heritage") || bgLower.includes("heritage")) {
        enhanced = enhanced.modulate({
            brightness: 1.1,
            saturation: 0.5,
            hue: 15,
        });
    }
    else if (promptLower.includes("innovation") || bgLower.includes("innovation")) {
        enhanced = enhanced
            .modulate({
            brightness: 1.05,
            saturation: 1.4,
        })
            .sharpen({ sigma: 1.5 });
    }
    else if (promptLower.includes("celebration") || bgLower.includes("celebration")) {
        enhanced = enhanced
            .modulate({
            brightness: 1.15,
            saturation: 1.3,
        })
            .sharpen();
    }
    else {
        enhanced = enhanced.modulate({
            brightness: 1.08,
            saturation: 1.1,
        });
    }
    return await enhanced.jpeg({ quality: 95 }).toBuffer();
}
/**
 * Health check
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});

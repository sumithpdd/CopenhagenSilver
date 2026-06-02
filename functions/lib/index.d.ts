import * as functions from "firebase-functions";
/**
 * Process photo with Gemini API for image transformation
 * Uses the real Gemini model for image-to-image processing
 */
export declare const processPhotoWithGemini: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Health check
 */
export declare const healthCheck: functions.HttpsFunction;

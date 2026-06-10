/**
 * Canon SELPHY CP1300 postcard portrait — 100×148 mm @ 300 dpi (Exif JPEG).
 * @see https://www.canon.com/support/ (CP1300 media specs)
 */

import sharp from 'sharp';

export const PRINT_DPI = 300;

/** Postcard / typical CP1300 media (100 × 148 mm). */
export const POSTCARD_WIDTH_MM = 100;
export const POSTCARD_HEIGHT_MM = 148;

/** L-size alternative (89 × 148 mm) — set PRINT_PAPER=l via env if needed. */
export const L_SIZE_WIDTH_MM = 89;

export function getPrintPaperWidthMm(): number {
  return process.env.PRINT_PAPER === 'l' ? L_SIZE_WIDTH_MM : POSTCARD_WIDTH_MM;
}

export function postcardPixelSize(dpi = PRINT_DPI): { width: number; height: number } {
  const widthMm = getPrintPaperWidthMm();
  return {
    width: Math.round((widthMm / 25.4) * dpi),
    height: Math.round((POSTCARD_HEIGHT_MM / 25.4) * dpi),
  };
}

/** Aspect ratio width:height for portrait postcard (≈ 100:148). */
export function printPortraitAspectRatio(): number {
  return getPrintPaperWidthMm() / POSTCARD_HEIGHT_MM;
}

/**
 * Fit image to portrait print canvas — cover + face-aware crop (no white letterbox bars).
 * Outputs JPEG with 300 dpi metadata for SELPHY drivers.
 */
export async function normalizeImageForPrintPortrait(input: Buffer): Promise<Buffer> {
  const { width, height } = postcardPixelSize();

  return sharp(input)
    .rotate()
    .resize(width, height, {
      fit: 'cover',
      position: sharp.strategy.attention,
    })
    .jpeg({
      quality: 92,
      mozjpeg: true,
      chromaSubsampling: '4:4:4',
    })
    .withMetadata({ density: PRINT_DPI })
    .toBuffer();
}

/** Crop/resize source photo to portrait 2:3 before sending to Gemini (better portrait output). */
export async function preparePortraitInputForGeneration(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64');
  const targetW = 832;
  const targetH = Math.round(targetW / printPortraitAspectRatio());

  const prepared = await sharp(buffer)
    .rotate()
    .resize(targetW, targetH, {
      fit: 'cover',
      position: sharp.strategy.attention,
    })
    .jpeg({ quality: 90 })
    .toBuffer();

  return prepared.toString('base64');
}

export function printPageSizeCss(): { width: string; height: string } {
  const w = getPrintPaperWidthMm();
  return {
    width: `${w}mm`,
    height: `${POSTCARD_HEIGHT_MM}mm`,
  };
}

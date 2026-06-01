import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { PhotoBoothPhoto } from '@/types';

let bucket: ReturnType<ReturnType<typeof getStorage>['bucket']> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

function initializeFirebase() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });
  }
  if (!bucket) bucket = getStorage().bucket();
  if (!db) db = getFirestore();
}

// Generate unique photo code
function generatePhotoCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SILVER${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    initializeFirebase();
    const formData = await request.formData();

    const sessionId = formData.get('sessionId') as string;
    const userName = formData.get('userName') as string;
    const userEmail = (formData.get('userEmail') as string) || undefined;
    const originalPhotoBase64 = formData.get('originalPhoto') as string;
    const compositedPhotoBase64 = formData.get('compositedPhoto') as string;
    const backgroundId = formData.get('backgroundId') as string;
    const promptId = formData.get('promptId') as string;

    if (!sessionId || !userName || !originalPhotoBase64 || !compositedPhotoBase64) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const photoCode = generatePhotoCode();
    const timestamp = Date.now();
    const photoId = `${sessionId}_${timestamp}`;

    // Upload original photo
    const originalBuffer = Buffer.from(
      originalPhotoBase64.split(',')[1],
      'base64'
    );
    const originalFile = bucket!.file(
      `sitecore-silver/${sessionId}/original_${timestamp}.jpg`
    );
    await originalFile.save(originalBuffer, { contentType: 'image/jpeg' });

    // Upload composited photo
    const compositedBuffer = Buffer.from(
      compositedPhotoBase64.split(',')[1],
      'base64'
    );
    const compositedFile = bucket!.file(
      `sitecore-silver/${sessionId}/composited_${timestamp}.jpg`
    );
    await compositedFile.save(compositedBuffer, { contentType: 'image/jpeg' });

    // Get download URLs
    const originalPhotoUrl = await originalFile.publicUrl();
    const compositedPhotoUrl = await compositedFile.publicUrl();

    // Save metadata to Firestore
    const photoData: PhotoBoothPhoto = {
      id: photoId,
      sessionId,
      userName,
      userEmail,
      originalPhotoUrl,
      compositedPhotoUrl,
      backgroundId,
      promptId,
      photoCode,
      createdAt: new Date(),
      metadata: {
        processingTime: 0,
      },
    };

    await db!.collection('photobooth').doc(photoId).set(photoData);

    return NextResponse.json({
      success: true,
      data: {
        photoId,
        photoCode,
        compositedPhotoUrl,
        originalPhotoUrl,
      },
    });
  } catch (error) {
    console.error('Error uploading photo:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to upload photo: ${errorMessage}` },
      { status: 500 }
    );
  }
}

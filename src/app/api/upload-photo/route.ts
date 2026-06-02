import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { PhotoBoothPhoto } from '@/types';

let bucket: ReturnType<ReturnType<typeof getStorage>['bucket']> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

function initializeFirebase() {
  if (!getApps().length) {
    // Firebase Admin SDK needs .appspot.com bucket, not .firebasestorage.app
    const bucketName = `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    console.log('🔑 [FIREBASE] Initializing with bucket:', bucketName);

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
      storageBucket: bucketName,
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
    console.log('🔗 [API] /api/upload-photo called');

    initializeFirebase();
    console.log('✅ [API] Firebase initialized');

    const formData = await request.formData();
    console.log('📥 [API] FormData keys:', Array.from(formData.keys()));

    const sessionId = formData.get('sessionId') as string;
    const userName = formData.get('userName') as string;
    const userEmail = (formData.get('userEmail') as string) || undefined;
    const originalPhotoBase64 = formData.get('originalPhoto') as string;
    const compositedPhotoBase64 = formData.get('compositedPhoto') as string;
    const backgroundId = formData.get('backgroundId') as string;
    const promptId = formData.get('promptId') as string;

    console.log('✅ [API] sessionId:', sessionId || 'MISSING');
    console.log('✅ [API] userName:', userName || 'MISSING');
    console.log('✅ [API] originalPhoto:', originalPhotoBase64 ? 'YES' : 'MISSING');
    console.log('✅ [API] compositedPhoto:', compositedPhotoBase64 ? 'YES' : 'MISSING');
    console.log('✅ [API] backgroundId:', backgroundId || 'MISSING');
    console.log('✅ [API] promptId:', promptId || 'MISSING');

    if (!sessionId || !userName || !originalPhotoBase64 || !compositedPhotoBase64) {
      console.error('❌ [API] Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📤 [API] Starting upload...');

    const photoCode = generatePhotoCode();
    const timestamp = Date.now();
    const photoId = `${sessionId}_${timestamp}`;

    // Upload original photo
    console.log('📤 [API] Uploading original photo...');
    const originalBuffer = Buffer.from(
      originalPhotoBase64.split(',')[1],
      'base64'
    );
    console.log('✅ [API] Original buffer size:', originalBuffer.length);

    const originalFile = bucket!.file(
      `sitecore-silver/${sessionId}/original_${timestamp}.jpg`
    );
    await originalFile.save(originalBuffer, {
      contentType: 'image/jpeg',
      public: true,
      metadata: { 'Cache-Control': 'public, max-age=31536000' }
    });
    console.log('✅ [API] Original photo saved to Storage (public)');

    // Upload composited photo
    console.log('📤 [API] Uploading composited photo...');
    const compositedBuffer = Buffer.from(
      compositedPhotoBase64.split(',')[1],
      'base64'
    );
    console.log('✅ [API] Composited buffer size:', compositedBuffer.length);

    const compositedFile = bucket!.file(
      `sitecore-silver/${sessionId}/composited_${timestamp}.jpg`
    );
    await compositedFile.save(compositedBuffer, {
      contentType: 'image/jpeg',
      public: true,
      metadata: { 'Cache-Control': 'public, max-age=31536000' }
    });
    console.log('✅ [API] Composited photo saved to Storage (public)');

    // Get download URLs
    console.log('🔗 [API] Getting public URLs...');
    const originalPhotoUrl = await originalFile.publicUrl();
    const compositedPhotoUrl = await compositedFile.publicUrl();
    console.log('✅ [API] Original URL:', originalPhotoUrl);
    console.log('✅ [API] Composited URL:', compositedPhotoUrl);

    // Save metadata to Firestore
    console.log('💾 [API] Saving to Firestore...');
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

    console.log('📝 [API] Photo data:', photoData);
    await db!.collection('photobooth').doc(photoId).set(photoData);
    console.log('✅ [API] Saved to Firestore collection: photobooth');

    console.log('✅ [API] Upload complete! Photo code:', photoCode);

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

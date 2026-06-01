import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { PhotoBoothPhoto } from '@/types';

let db: ReturnType<typeof getFirestore> | null = null;

function getDb() {
  if (!db) {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        }),
      });
    }
    db = getFirestore();
  }
  return db;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 [GALLERY API] GET /api/gallery called');

    // Initialize Firebase on first request
    getDb();
    console.log('✅ [GALLERY API] Firebase initialized');

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    console.log('📊 [GALLERY API] Query params:', { searchQuery, category, sortBy, limit, offset });

    // Build query
    console.log('📖 [GALLERY API] Building Firestore query...');
    const collectionRef = getDb().collection('photobooth');
    const query = sortBy === 'oldest'
      ? collectionRef.orderBy('createdAt', 'asc')
      : collectionRef.orderBy('createdAt', 'desc');

    // Get total count
    console.log('📊 [GALLERY API] Getting total count...');
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;
    console.log('📊 [GALLERY API] Total photos in Firestore:', total);

    // Get paginated results
    console.log('📄 [GALLERY API] Fetching paginated results...');
    const snapshot = await query.limit(limit).offset(offset).get();
    console.log('📄 [GALLERY API] Documents retrieved:', snapshot.size);

    const photos: PhotoBoothPhoto[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📸 [GALLERY API] Processing doc:', doc.id, 'userName:', data.userName, 'code:', data.photoCode);

      // Apply filters
      if (
        searchQuery &&
        !data.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !data.photoCode.includes(searchQuery.toUpperCase())
      ) {
        console.log('⏭️ [GALLERY API] Skipping - search filter mismatch');
        return;
      }

      if (category && data.backgroundId !== category) {
        console.log('⏭️ [GALLERY API] Skipping - category filter mismatch');
        return;
      }

      photos.push({
        id: doc.id,
        sessionId: data.sessionId,
        userName: data.userName,
        userEmail: data.userEmail,
        originalPhotoUrl: data.originalPhotoUrl,
        compositedPhotoUrl: data.compositedPhotoUrl,
        backgroundId: data.backgroundId,
        promptId: data.promptId,
        photoCode: data.photoCode,
        createdAt: data.createdAt?.toDate() || new Date(),
        metadata: data.metadata,
      });
    });

    console.log('✅ [GALLERY API] Final photos count:', photos.length);
    console.log('✅ [GALLERY API] Returning response:', { total, photoCount: photos.length, offset, limit });

    return NextResponse.json({
      success: true,
      data: {
        photos,
        total: photos.length,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to fetch gallery: ${errorMessage}` },
      { status: 500 }
    );
  }
}

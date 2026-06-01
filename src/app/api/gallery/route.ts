import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { PhotoBoothPhoto } from '@/types';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = getFirestore();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    const collectionRef = db.collection('photobooth');
    const query = sortBy === 'oldest'
      ? collectionRef.orderBy('createdAt', 'asc')
      : collectionRef.orderBy('createdAt', 'desc');

    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Get paginated results
    const snapshot = await query.limit(limit).offset(offset).get();

    const photos: PhotoBoothPhoto[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Apply filters
      if (
        searchQuery &&
        !data.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !data.photoCode.includes(searchQuery.toUpperCase())
      ) {
        return;
      }

      if (category && data.backgroundId !== category) {
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

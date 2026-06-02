import { NextRequest, NextResponse } from 'next/server';
import { docToPhoto, getFirebaseAdmin, isPhotoPublicInGallery } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { db } = getFirebaseAdmin();

    const { searchParams } = new URL(request.url);
    const searchQuery = (searchParams.get('search') || '').toLowerCase();
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const collectionRef = db.collection('photobooth');

    let snapshot;
    try {
      const ordered =
        sortBy === 'oldest'
          ? collectionRef.orderBy('createdAt', 'asc')
          : collectionRef.orderBy('createdAt', 'desc');
      snapshot = await ordered.limit(500).get();
    } catch (queryError) {
      console.warn(
        '[GALLERY] orderBy(createdAt) failed, falling back to unordered fetch:',
        queryError
      );
      snapshot = await collectionRef.limit(500).get();
    }

    const allPublic = [];

    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        if (!isPhotoPublicInGallery(data)) continue;

        const photo = docToPhoto(doc.id, data);

        if (
          !photo.compositedPhotoUrl ||
          !photo.originalPhotoUrl
        ) {
          continue;
        }

        if (
          searchQuery &&
          !photo.userName.toLowerCase().includes(searchQuery) &&
          !photo.photoCode.toUpperCase().includes(searchQuery.toUpperCase())
        ) {
          continue;
        }

        if (category && photo.backgroundId !== category) continue;

        allPublic.push(photo);
      } catch (docError) {
        console.warn('[GALLERY] Skipping malformed doc', doc.id, docError);
      }
    }

    if (sortBy === 'newest') {
      allPublic.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      allPublic.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    const total = allPublic.length;
    const photos = allPublic.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        photos,
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[GALLERY] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isConfig =
      message.includes('not configured') ||
      message.includes('FIREBASE_') ||
      message.includes('private key') ||
      message.includes('credential');

    return NextResponse.json(
      {
        success: false,
        error: isConfig
          ? 'Gallery unavailable: Firebase is not configured on the server. Add Firebase Admin env vars in Vercel.'
          : `Failed to fetch gallery: ${message}`,
      },
      { status: isConfig ? 503 : 500 }
    );
  }
}

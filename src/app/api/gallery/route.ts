import { NextRequest, NextResponse } from 'next/server';
import { docToPhoto, getFirebaseAdmin, isPhotoPublicInGallery } from '@/lib/firebase-admin';
import type { PhotoBoothPhoto } from '@/types';

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
    const query =
      sortBy === 'oldest'
        ? collectionRef.orderBy('createdAt', 'asc')
        : collectionRef.orderBy('createdAt', 'desc');

    const snapshot = await query.limit(500).get();

    const allPublic: PhotoBoothPhoto[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!isPhotoPublicInGallery(data)) return;

      const photo = docToPhoto(doc.id, data);

      if (
        searchQuery &&
        !photo.userName.toLowerCase().includes(searchQuery) &&
        !photo.photoCode.toUpperCase().includes(searchQuery.toUpperCase())
      ) {
        return;
      }

      if (category && photo.backgroundId !== category) return;

      allPublic.push(photo);
    });

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
    console.error('Error fetching gallery:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to fetch gallery: ${errorMessage}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, unauthorizedAdminResponse } from '@/lib/admin-auth';
import { docToPhoto, getFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const { db } = getFirebaseAdmin();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);
    const visibility = searchParams.get('visibility');

    let query = db.collection('photobooth').orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    const photos = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (visibility === 'public' && data.visibility === 'hidden') continue;
      if (visibility === 'hidden' && data.visibility !== 'hidden') continue;
      photos.push(docToPhoto(doc.id, data));
    }

    return NextResponse.json({
      success: true,
      data: { photos, total: photos.length },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdminRequest, unauthorizedAdminResponse } from '@/lib/admin-auth';
import { docToPhoto, getFirebaseAdmin } from '@/lib/firebase-admin';
import { deletePhotoCompletely } from '@/lib/photo-moderation';

const patchSchema = z.object({
  visibility: z.enum(['public', 'hidden']).optional(),
  moderationStatus: z.enum(['approved', 'pending', 'rejected']).optional(),
  userName: z.string().min(1).max(50).optional(),
  moderationNote: z.string().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { db } = getFirebaseAdmin();
    const ref = db.collection('photobooth').doc(params.id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Photo not found' }, { status: 404 });
    }

    await ref.update({
      ...parsed.data,
      updatedAt: new Date(),
    });

    const updated = await ref.get();
    return NextResponse.json({
      success: true,
      data: docToPhoto(params.id, updated.data()!),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminRequest(request)) {
    return unauthorizedAdminResponse();
  }

  try {
    await deletePhotoCompletely(params.id);
    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

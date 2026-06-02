import { FieldValue } from 'firebase-admin/firestore';
import type { Bucket } from '@google-cloud/storage';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

/** Delete Firestore doc and Storage files for a photo (Flutter parity). */
export async function deletePhotoCompletely(photoId: string): Promise<void> {
  const { db, bucket } = getFirebaseAdmin();
  const ref = db.collection('photobooth').doc(photoId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error('Photo not found');
  }

  const data = snap.data()!;

  try {
    await ref.update({ originalPhotoUrl: FieldValue.delete() });
  } catch {
    // ignore
  }

  const urls = [data.originalPhotoUrl, data.compositedPhotoUrl].filter(
    (u): u is string => typeof u === 'string' && u.length > 0
  );

  for (const url of urls) {
    await deleteStorageUrl(bucket, url);
  }

  await ref.delete();
}

async function deleteStorageUrl(bucket: Bucket, url: string) {
  try {
    const firebasePath = extractStoragePath(url);
    if (firebasePath) {
      await bucket.file(firebasePath).delete({ ignoreNotFound: true });
    }
  } catch (e) {
    console.warn('Storage delete warning:', e);
  }
}

function extractStoragePath(url: string): string | null {
  const encoded = url.match(/\/o\/(.+?)(\?|$)/);
  if (encoded?.[1]) return decodeURIComponent(encoded[1]);

  if (url.includes('storage.googleapis.com')) {
    const marker = '.app/';
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      return decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
    }
  }
  return null;
}

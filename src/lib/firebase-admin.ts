import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { FieldValue, getFirestore, Firestore, DocumentData } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { parseAttendeeProfileFromDoc } from '@/lib/firebase-user';

let db: Firestore | null = null;
let storage: Storage | null = null;

function parsePrivateKey(raw: string): string {
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n');
}

function getServiceAccount(): ServiceAccount {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as ServiceAccount & { private_key?: string };
      if (parsed.private_key) {
        parsed.private_key = parsePrivateKey(parsed.private_key);
      }
      return parsed;
    } catch {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY is set but is not valid JSON. Paste the full service account JSON from Firebase Console.'
      );
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in Vercel (or FIREBASE_SERVICE_ACCOUNT_KEY as full JSON).'
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey: parsePrivateKey(privateKeyRaw),
  };
}

function getStorageBucketName(): string {
  return (
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
    `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
  );
}

export function getFirebaseAdmin() {
  if (!getApps().length) {
    const bucketName = getStorageBucketName();
    initializeApp({
      credential: cert(getServiceAccount()),
      storageBucket: bucketName,
    });
  }

  if (!db) db = getFirestore();
  if (!storage) storage = getStorage();

  return {
    db,
    bucket: storage.bucket(getStorageBucketName()),
  };
}

export function isPhotoPublicInGallery(data: DocumentData): boolean {
  if (data.visibility === 'hidden') return false;
  if (data.moderationStatus === 'rejected') return false;
  if (data.consentGalleryShare === false) return false;
  return true;
}

function toIsoDate(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date().toISOString() : value.toISOString();
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const d = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

/** API-safe photo shape (JSON-serializable). */
export function docToPhoto(id: string, data: DocumentData) {
  const attendeeProfile = parseAttendeeProfileFromDoc(
    data.attendeeProfile as Record<string, unknown> | undefined
  );

  return {
    id,
    sessionId: String(data.sessionId ?? ''),
    userName: String(data.userName ?? 'Guest'),
    userEmail: data.userEmail ? String(data.userEmail) : undefined,
    ...(attendeeProfile && { attendeeProfile }),
    originalPhotoUrl: String(data.originalPhotoUrl ?? ''),
    compositedPhotoUrl: String(data.compositedPhotoUrl ?? ''),
    backgroundId: String(data.backgroundId ?? ''),
    promptId: String(data.promptId ?? ''),
    photoCode: String(data.photoCode ?? id),
    createdAt: toIsoDate(data.createdAt),
    visibility: (data.visibility as 'public' | 'hidden') ?? 'public',
    moderationStatus:
      (data.moderationStatus as 'approved' | 'pending' | 'rejected') ?? 'approved',
    consentGalleryShare: data.consentGalleryShare !== false,
    consentTermsAcceptedAt: data.consentTermsAcceptedAt
      ? toIsoDate(data.consentTermsAcceptedAt)
      : undefined,
    moderationNote: data.moderationNote ? String(data.moderationNote) : undefined,
    updatedAt: data.updatedAt ? toIsoDate(data.updatedAt) : undefined,
    metadata: data.metadata,
  };
}

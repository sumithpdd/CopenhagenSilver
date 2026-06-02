import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore, DocumentData } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let db: Firestore | null = null;
let storage: Storage | null = null;

export function getFirebaseAdmin() {
  if (!getApps().length) {
    const bucketName =
      process.env.FIREBASE_STORAGE_BUCKET ||
      `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
      storageBucket: bucketName,
    });
  }

  if (!db) db = getFirestore();
  if (!storage) storage = getStorage();

  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET ||
    `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;

  return {
    db,
    bucket: storage.bucket(bucketName),
  };
}

export function isPhotoPublicInGallery(data: DocumentData): boolean {
  if (data.visibility === 'hidden') return false;
  if (data.moderationStatus === 'rejected') return false;
  if (data.consentGalleryShare === false) return false;
  return true;
}

export function docToPhoto(id: string, data: DocumentData) {
  return {
    id,
    sessionId: data.sessionId as string,
    userName: data.userName as string,
    userEmail: data.userEmail as string | undefined,
    originalPhotoUrl: data.originalPhotoUrl as string,
    compositedPhotoUrl: data.compositedPhotoUrl as string,
    backgroundId: data.backgroundId as string,
    promptId: data.promptId as string,
    photoCode: data.photoCode as string,
    createdAt: data.createdAt?.toDate?.() ?? new Date(data.createdAt),
    visibility: (data.visibility as 'public' | 'hidden') ?? 'public',
    moderationStatus:
      (data.moderationStatus as 'approved' | 'pending' | 'rejected') ?? 'approved',
    consentGalleryShare: data.consentGalleryShare !== false,
    consentTermsAcceptedAt: data.consentTermsAcceptedAt?.toDate?.() ?? data.consentTermsAcceptedAt,
    moderationNote: data.moderationNote as string | undefined,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
    metadata: data.metadata,
  };
}

import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import type { AttendeeProfile } from '@/types';

export const PHOTOBOOTH_SESSIONS_COLLECTION = 'photobooth_sessions';

/** Strip undefined so Firestore accepts the payload. */
export function buildAttendeeProfileDoc(
  profile: AttendeeProfile
): Record<string, string> {
  const doc: Record<string, string> = {
    fullName: profile.fullName.trim(),
  };

  if (profile.company?.trim()) doc.company = profile.company.trim();
  if (profile.companyDescription?.trim()) {
    doc.companyDescription = profile.companyDescription.trim();
  }
  if (profile.role?.trim()) doc.role = profile.role.trim();
  if (profile.linkedInUrl?.trim()) doc.linkedInUrl = profile.linkedInUrl.trim();
  if (profile.headline?.trim()) doc.headline = profile.headline.trim();

  return doc;
}

export interface BoothSessionWrite {
  sessionId: string;
  userName: string;
  userEmail?: string;
  attendeeProfile: AttendeeProfile;
  consentTermsAccepted: boolean;
  consentGalleryShare: boolean;
  consentTermsAcceptedAt?: Date;
  latestPhotoId?: string;
  latestPhotoCode?: string;
  latestBackgroundId?: string;
  latestPromptId?: string;
  sitecoreAttendeePath?: string;
}

export async function upsertBoothSession(
  db: Firestore,
  data: BoothSessionWrite
): Promise<void> {
  const now = new Date();
  const ref = db.collection(PHOTOBOOTH_SESSIONS_COLLECTION).doc(data.sessionId);

  const payload: Record<string, unknown> = {
    sessionId: data.sessionId,
    userName: data.userName.trim(),
    attendeeProfile: buildAttendeeProfileDoc(data.attendeeProfile),
    consentTermsAccepted: data.consentTermsAccepted,
    consentGalleryShare: data.consentGalleryShare,
    updatedAt: now,
  };

  if (data.userEmail?.trim()) {
    payload.userEmail = data.userEmail.trim();
  }
  if (data.consentTermsAcceptedAt) {
    payload.consentTermsAcceptedAt = data.consentTermsAcceptedAt;
  }
  if (data.latestPhotoId) payload.latestPhotoId = data.latestPhotoId;
  if (data.latestPhotoCode) payload.latestPhotoCode = data.latestPhotoCode;
  if (data.latestBackgroundId) payload.latestBackgroundId = data.latestBackgroundId;
  if (data.latestPromptId) payload.latestPromptId = data.latestPromptId;
  if (data.sitecoreAttendeePath) payload.sitecoreAttendeePath = data.sitecoreAttendeePath;

  const snap = await ref.get();
  await ref.set(
    {
      ...payload,
      ...(snap.exists ? {} : { createdAt: now }),
    },
    { merge: true }
  );

  if (data.latestPhotoId) {
    await ref.update({
      photoIds: FieldValue.arrayUnion(data.latestPhotoId),
    });
  }
}

export function parseAttendeeProfileFromDoc(
  data: Record<string, unknown> | undefined
): AttendeeProfile | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const fullName = String(data.fullName ?? '').trim();
  if (!fullName) return undefined;

  const profile: AttendeeProfile = { fullName };
  const optional = [
    'company',
    'companyDescription',
    'role',
    'linkedInUrl',
    'headline',
  ] as const;

  for (const key of optional) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) {
      profile[key] = value.trim();
    }
  }

  return profile;
}

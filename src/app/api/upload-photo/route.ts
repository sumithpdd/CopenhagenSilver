import { NextRequest, NextResponse } from 'next/server';
import { resolveAppConfig } from '@/lib/core/app-config';
import { requireApiAuth } from '@/lib/core/api-auth';
import { docToPhoto, getFirebaseAdmin } from '@/lib/firebase-admin';
import {
  buildAttendeeProfileDoc,
  upsertBoothSession,
} from '@/lib/firebase-user';
import {
  createOrUpdateAttendeePage,
  isAttendeePageSyncConfigured,
} from '@/lib/sitecore/attendee-profile';
import type { AttendeeProfile } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function generatePhotoCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

function parseBool(value: FormDataEntryValue | null): boolean {
  if (value === null || value === '') return false;
  const s = String(value).toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

function parseOptionalString(value: FormDataEntryValue | null): string | undefined {
  if (value === null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function parseAttendeeProfile(formData: FormData, userName: string): AttendeeProfile {
  return {
    fullName: parseOptionalString(formData.get('fullName')) ?? userName,
    company: parseOptionalString(formData.get('company')),
    companyDescription: parseOptionalString(formData.get('companyDescription')),
    role: parseOptionalString(formData.get('role')),
    linkedInUrl: parseOptionalString(formData.get('linkedInUrl')),
    headline: parseOptionalString(formData.get('headline')),
  };
}

export async function POST(request: NextRequest) {
  const auth = requireApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { branding } = resolveAppConfig();
    const storagePrefix = branding.storagePathPrefix;

    const { db, bucket } = getFirebaseAdmin();
    const formData = await request.formData();

    const sessionId = formData.get('sessionId') as string;
    const userName = formData.get('userName') as string;
    const userEmail = (formData.get('userEmail') as string) || undefined;
    const originalPhotoBase64 = formData.get('originalPhoto') as string;
    const compositedPhotoBase64 = formData.get('compositedPhoto') as string;
    const backgroundId = formData.get('backgroundId') as string;
    const promptId = formData.get('promptId') as string;
    const consentTermsAccepted = parseBool(formData.get('consentTermsAccepted'));
    const consentGalleryShare = parseBool(formData.get('consentGalleryShare'));

    if (!sessionId || !userName || !originalPhotoBase64 || !compositedPhotoBase64) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!consentTermsAccepted) {
      return NextResponse.json(
        { success: false, error: 'Terms and privacy notice must be accepted' },
        { status: 400 }
      );
    }

    const photoCode = generatePhotoCode(branding.photoCodePrefix);
    const timestamp = Date.now();
    const photoId = `${sessionId}_${timestamp}`;
    const now = new Date();

    const originalBuffer = Buffer.from(
      originalPhotoBase64.split(',')[1] || originalPhotoBase64,
      'base64'
    );
    const originalFile = bucket.file(
      `${storagePrefix}/${sessionId}/original_${timestamp}.jpg`
    );
    await originalFile.save(originalBuffer, {
      contentType: 'image/jpeg',
      public: true,
      metadata: { 'Cache-Control': 'public, max-age=31536000' },
    });

    const compositedBuffer = Buffer.from(
      compositedPhotoBase64.split(',')[1] || compositedPhotoBase64,
      'base64'
    );
    const compositedFile = bucket.file(
      `${storagePrefix}/${sessionId}/composited_${timestamp}.jpg`
    );
    await compositedFile.save(compositedBuffer, {
      contentType: 'image/jpeg',
      public: true,
      metadata: { 'Cache-Control': 'public, max-age=31536000' },
    });

    const originalPhotoUrl = await originalFile.publicUrl();
    const compositedPhotoUrl = await compositedFile.publicUrl();

    const visibility = consentGalleryShare ? 'public' : 'hidden';
    const profile = parseAttendeeProfile(formData, userName);

    const photoDoc = {
      sessionId,
      userName,
      userEmail,
      attendeeProfile: buildAttendeeProfileDoc(profile),
      originalPhotoUrl,
      compositedPhotoUrl,
      backgroundId,
      promptId,
      photoCode,
      createdAt: now,
      updatedAt: now,
      visibility,
      moderationStatus: 'approved' as const,
      consentGalleryShare,
      consentTermsAccepted,
      consentTermsAcceptedAt: now,
      metadata: { processingTime: 0 },
    };

    await db.collection('photobooth').doc(photoId).set(photoDoc);

    let sitecoreAttendeePage = null;
    let sitecoreSyncError: string | null = null;
    const syncToSitecore =
      parseBool(formData.get('syncToSitecore')) ||
      resolveAppConfig().features.sitecoreAttendeePages;

    if (syncToSitecore && isAttendeePageSyncConfigured()) {
      try {
        sitecoreAttendeePage = await createOrUpdateAttendeePage({
          profile,
          photoCode,
          originalPhotoUrl,
          enhancedPhotoUrl: compositedPhotoUrl,
        });
        console.log(
          '✅ [SITECORE] Attendee page',
          sitecoreAttendeePage.created ? 'created' : 'updated',
          sitecoreAttendeePage.path
        );
      } catch (sitecoreError) {
        sitecoreSyncError =
          sitecoreError instanceof Error ? sitecoreError.message : String(sitecoreError);
        console.error('⚠️ [SITECORE] Attendee page sync failed:', sitecoreError);
        // Photo upload still succeeds — Sitecore sync is best-effort
      }
    } else if (syncToSitecore && !isAttendeePageSyncConfigured()) {
      sitecoreSyncError =
        'Sitecore attendee sync not configured (SITECORE_CLIENT_ID, SITECORE_CLIENT_SECRET, XMC_HOST).';
    }

    try {
      await upsertBoothSession(db, {
        sessionId,
        userName,
        userEmail,
        attendeeProfile: profile,
        consentTermsAccepted,
        consentGalleryShare,
        consentTermsAcceptedAt: now,
        latestPhotoId: photoId,
        latestPhotoCode: photoCode,
        latestBackgroundId: backgroundId,
        latestPromptId: promptId,
        sitecoreAttendeePath: sitecoreAttendeePage?.path,
      });
    } catch (sessionError) {
      console.error('⚠️ [FIREBASE] Session profile save failed:', sessionError);
    }

    return NextResponse.json({
      success: true,
      data: {
        photoId,
        photoCode,
        compositedPhotoUrl,
        originalPhotoUrl,
        visibility,
        consentGalleryShare,
        photo: docToPhoto(photoId, photoDoc),
        sitecoreAttendeePage,
        sitecoreSyncError,
      },
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to upload photo: ${errorMessage}` },
      { status: 500 }
    );
  }
}

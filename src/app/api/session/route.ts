import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiAuth } from '@/lib/core/api-auth';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { upsertBoothSession } from '@/lib/firebase-user';
import { attendeeProfileSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

const sessionBodySchema = z.object({
  sessionId: z.string().min(1),
  userName: z.string().trim().min(2).max(100),
  userEmail: z.union([z.literal(''), z.string().trim().email()]).optional(),
  attendeeProfile: attendeeProfileSchema,
  consentTermsAccepted: z.boolean(),
  consentGalleryShare: z.boolean(),
});

/**
 * POST /api/session
 * Saves booth user profile + consent when they start the flow (input form).
 */
export async function POST(request: NextRequest) {
  const auth = requireApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = sessionBodySchema.parse(await request.json());
    const { db } = getFirebaseAdmin();
    const now = new Date();

    await upsertBoothSession(db, {
      sessionId: body.sessionId,
      userName: body.userName,
      userEmail: body.userEmail || undefined,
      attendeeProfile: body.attendeeProfile,
      consentTermsAccepted: body.consentTermsAccepted,
      consentGalleryShare: body.consentGalleryShare,
      consentTermsAcceptedAt: body.consentTermsAccepted ? now : undefined,
    });

    return NextResponse.json({
      success: true,
      data: { sessionId: body.sessionId },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message ?? 'Invalid session data' },
        { status: 400 }
      );
    }
    console.error('[api/session]', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save session',
      },
      { status: 500 }
    );
  }
}

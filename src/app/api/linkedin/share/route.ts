import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/core/api-auth';
import { generateLinkedInCaption } from '@/lib/linkedin/caption';
import { getLinkedInSession, isLinkedInConfigured } from '@/lib/linkedin/auth';
import {
  publishLinkedInImagePost,
  resolveImageBuffer,
  uploadLinkedInImage,
} from '@/lib/linkedin/post';

export const dynamic = 'force-dynamic';

/** POST /api/linkedin/share — publish AI enhanced image + caption to member feed. */
export async function POST(request: NextRequest) {
  const auth = requireApiAuth(request);
  if (!auth.authorized) return auth.response;

  if (!isLinkedInConfigured()) {
    return NextResponse.json(
      { success: false, error: 'LinkedIn sharing not configured' },
      { status: 503 }
    );
  }

  const session = await getLinkedInSession();
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: 'Not connected to LinkedIn — authorize first via Connect LinkedIn',
        code: 'NOT_CONNECTED',
      },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      image?: string;
      imageUrl?: string;
      userName?: string;
      promptTitle?: string;
      backgroundName?: string;
      company?: string;
      companyDescription?: string;
      role?: string;
      headline?: string;
      photoCode?: string;
      caption?: string;
    };

    if (!body.image?.trim() && !body.imageUrl?.trim()) {
      return NextResponse.json(
        { success: false, error: 'image or imageUrl is required' },
        { status: 400 }
      );
    }

    if (!body.userName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'userName is required' },
        { status: 400 }
      );
    }

    const caption =
      body.caption?.trim() ||
      (await generateLinkedInCaption({
        userName: body.userName.trim(),
        promptTitle: body.promptTitle,
        backgroundName: body.backgroundName,
        company: body.company,
        companyDescription: body.companyDescription,
        role: body.role,
        headline: body.headline,
        photoCode: body.photoCode,
      }));

    const imageBuffer = await resolveImageBuffer(body.image, body.imageUrl);

    const assetUrn = await uploadLinkedInImage(
      session.accessToken,
      session.personId,
      imageBuffer
    );

    const { id } = await publishLinkedInImagePost(
      session.accessToken,
      session.personId,
      assetUrn,
      caption
    );

    return NextResponse.json({
      success: true,
      data: {
        postId: id,
        caption,
        message: 'Posted to your LinkedIn feed',
      },
    });
  } catch (error) {
    console.error('[linkedin/share]', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'LinkedIn post failed',
      },
      { status: 500 }
    );
  }
}

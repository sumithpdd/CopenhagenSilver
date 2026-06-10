import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/core/api-auth';
import { generateLinkedInCaption } from '@/lib/linkedin/caption';
import { isLinkedInConfigured } from '@/lib/linkedin/auth';

export const dynamic = 'force-dynamic';

/** POST /api/linkedin/caption — generate AI post text with hashtags. */
export async function POST(request: NextRequest) {
  const auth = requireApiAuth(request);
  if (!auth.authorized) return auth.response;

  if (!isLinkedInConfigured()) {
    return NextResponse.json(
      { success: false, error: 'LinkedIn sharing not configured' },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      userName?: string;
      promptTitle?: string;
      backgroundName?: string;
      company?: string;
      role?: string;
      photoCode?: string;
    };

    if (!body.userName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'userName is required' },
        { status: 400 }
      );
    }

    const caption = await generateLinkedInCaption({
      userName: body.userName.trim(),
      promptTitle: body.promptTitle,
      backgroundName: body.backgroundName,
      company: body.company,
      role: body.role,
      photoCode: body.photoCode,
    });

    return NextResponse.json({
      success: true,
      data: { caption },
    });
  } catch (error) {
    console.error('[linkedin/caption]', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Caption generation failed',
      },
      { status: 500 }
    );
  }
}

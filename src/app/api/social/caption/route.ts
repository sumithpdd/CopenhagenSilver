import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/core/api-auth';
import { generateLinkedInCaption } from '@/lib/linkedin/caption';

export const dynamic = 'force-dynamic';

/** POST /api/social/caption — AI post text with hashtags (no LinkedIn OAuth required). */
export async function POST(request: NextRequest) {
  const auth = requireApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = (await request.json()) as {
      userName?: string;
      promptTitle?: string;
      backgroundName?: string;
      company?: string;
      companyDescription?: string;
      role?: string;
      headline?: string;
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
      companyDescription: body.companyDescription,
      role: body.role,
      headline: body.headline,
      photoCode: body.photoCode,
    });

    return NextResponse.json({
      success: true,
      data: { caption },
    });
  } catch (error) {
    console.error('[api/social/caption]', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Caption generation failed',
      },
      { status: 500 }
    );
  }
}

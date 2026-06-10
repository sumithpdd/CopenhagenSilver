import { NextResponse } from 'next/server';
import { resolveAppConfig } from '@/lib/core/app-config';
import { isLinkedInConfigured } from '@/lib/linkedin/auth';
import { getSitecoreBrandRules } from '@/lib/sitecore/brand-rules';

/**
 * GET /api/config
 * Public read-only app configuration for client bootstrap.
 */
export async function GET() {
  try {
    const config = resolveAppConfig();

    if (config.brandRules.enabled) {
      const rules = getSitecoreBrandRules();
      config.brandRules = { ...config.brandRules, ...rules };
    }

    return NextResponse.json({
      success: true,
      data: {
        mode: config.mode,
        branding: config.branding,
        features: {
          ...config.features,
          linkedInConfigured: isLinkedInConfigured(),
          linkedInShare:
            config.features.linkedInShare || isLinkedInConfigured(),
          socialShare: true,
        },
        backgrounds: config.backgrounds,
        prompts: config.prompts,
        // Do not expose full brand rules to client — server-only for Gemini
        brandRulesEnabled: config.brandRules.enabled,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

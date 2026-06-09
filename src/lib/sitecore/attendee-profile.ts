/**
 * Create or update SitecoreSilverAttendeeProfile items under SilverAttendees.
 */

import { generateAttendeeAiQuote } from '@/lib/gemini-quote';
import { isSitecoreConfigured } from '@/lib/core/runtime-mode';
import type { AttendeeProfile } from '@/types';
import {
  createSitecoreItem,
  getItemByPath,
  sanitizeSitecoreItemName,
  updateSitecoreItem,
  type SitecoreFieldInput,
} from '@/lib/sitecore/items';

import {
  DEFAULT_ATTENDEES_PARENT_PATH,
  DEFAULT_ATTENDEE_TEMPLATE_ID,
} from '@/lib/sitecore/constants';

export interface CreateAttendeePageInput {
  profile: AttendeeProfile;
  photoCode: string;
  originalPhotoUrl: string;
  enhancedPhotoUrl: string;
  language?: string;
}

export interface CreateAttendeePageResult {
  itemId: string;
  path: string;
  name: string;
  aiQuote: string;
  created: boolean;
}

export function isAttendeePageSyncConfigured(): boolean {
  return isSitecoreConfigured();
}

export function getAttendeesParentPath(): string {
  return (
    process.env.SITECORE_ATTENDEES_PARENT_PATH?.trim() ||
    DEFAULT_ATTENDEES_PARENT_PATH
  );
}

export function getAttendeeTemplateId(): string {
  return (
    process.env.SITECORE_ATTENDEE_TEMPLATE_ID?.trim() ||
    DEFAULT_ATTENDEE_TEMPLATE_ID
  );
}

/** Image fields on SitecoreSilverAttendeeProfile expect ImageField JSON, not plain URLs. */
function formatSitecoreImageFieldValue(url: string): string {
  return JSON.stringify({ src: url, alt: '', mediaUrl: url });
}

function buildAttendeeFields(
  profile: AttendeeProfile,
  photoCode: string,
  originalPhotoUrl: string,
  enhancedPhotoUrl: string,
  aiQuote: string
): SitecoreFieldInput[] {
  const fields: SitecoreFieldInput[] = [
    { name: 'Name', value: profile.fullName },
    { name: 'OriginalPhoto', value: formatSitecoreImageFieldValue(originalPhotoUrl) },
    { name: 'EnhancedPhoto', value: formatSitecoreImageFieldValue(enhancedPhotoUrl) },
    { name: 'AIQuote', value: aiQuote },
    { name: 'PhotoCode', value: photoCode },
  ];

  if (profile.company) fields.push({ name: 'Company', value: profile.company });
  if (profile.companyDescription) {
    fields.push({ name: 'CompanyDescription', value: profile.companyDescription });
  }
  if (profile.role) fields.push({ name: 'Role', value: profile.role });
  if (profile.linkedInUrl) {
    fields.push({ name: 'LinkedInUrl', value: profile.linkedInUrl });
  }
  if (profile.headline) fields.push({ name: 'Headline', value: profile.headline });

  return fields;
}

/**
 * Creates a new attendee item or updates an existing one at the same path.
 * Item name defaults to full name; duplicates get " - {photoCode}" suffix.
 */
export async function createOrUpdateAttendeePage(
  input: CreateAttendeePageInput
): Promise<CreateAttendeePageResult> {
  if (!isAttendeePageSyncConfigured()) {
    throw new Error(
      'Sitecore attendee sync not configured. Set SITECORE_CLIENT_ID, SITECORE_CLIENT_SECRET, XMC_HOST, and SITECORE_ATTENDEE_TEMPLATE_ID.'
    );
  }

  const templateId = getAttendeeTemplateId();
  const parentPath = getAttendeesParentPath();
  const language = input.language ?? 'en';

  const parent = await getItemByPath(parentPath, language);
  if (!parent) {
    throw new Error(`SilverAttendees parent folder not found at: ${parentPath}`);
  }

  const aiQuote = await generateAttendeeAiQuote({
    fullName: input.profile.fullName,
    company: input.profile.company,
    role: input.profile.role,
    headline: input.profile.headline,
    photoCode: input.photoCode,
  });

  const fields = buildAttendeeFields(
    input.profile,
    input.photoCode,
    input.originalPhotoUrl,
    input.enhancedPhotoUrl,
    aiQuote
  );

  const displayName = sanitizeSitecoreItemName(input.profile.fullName);
  const photoCodeName = sanitizeSitecoreItemName(input.photoCode);

  // Prefer human-readable path: /SilverAttendees/Sumith Damodaran
  // If that name already exists (repeat attendee), create /SilverAttendees/SILVER…
  const createAndFill = async (name: string) => {
    const created = await createSitecoreItem({
      name,
      templateId,
      parentId: parent.itemId,
      language,
    });
    const updated = await updateSitecoreItem({
      itemId: created.itemId,
      language,
      fields,
    });
    return updated;
  };

  try {
    const item = await createAndFill(displayName || photoCodeName);
    return {
      itemId: item.itemId,
      path: item.path,
      name: item.name,
      aiQuote,
      created: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/duplicate|already exists|same name/i.test(message)) {
      throw error;
    }

    const existing = await getItemByPath(`${parentPath}/${displayName}`, language);
    if (existing) {
      const updated = await updateSitecoreItem({
        itemId: existing.itemId,
        language,
        fields,
      });
      return {
        itemId: updated.itemId,
        path: updated.path,
        name: updated.name,
        aiQuote,
        created: false,
      };
    }

    const item = await createAndFill(photoCodeName);
    return {
      itemId: item.itemId,
      path: item.path,
      name: item.name,
      aiQuote,
      created: true,
    };
  }
}

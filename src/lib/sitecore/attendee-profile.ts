/**
 * Create or update SitecoreSilverAttendeeProfile items under SilverAttendees.
 */

import { generateAttendeeAiQuote } from '@/lib/gemini-quote';
import { isSitecoreConfigured } from '@/lib/core/runtime-mode';
import type { AttendeeProfile } from '@/types';
import {
  createSitecoreItem,
  findChildItemByName,
  getItemByPath,
  joinSitecoreItemPath,
  sanitizeSitecoreItemName,
  updateSitecoreItemField,
  type SitecoreFieldInput,
  type SitecoreItemRef,
} from '@/lib/sitecore/items';

import {
  DEFAULT_ATTENDEES_PARENT_PATH,
  DEFAULT_ATTENDEE_TEMPLATE_ID,
} from '@/lib/sitecore/constants';
import { getSitecoreContentEditorUrl } from '@/lib/sitecore/cm-url';

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
  /** XM Cloud Content Editor deep link (when XMC_HOST is set). */
  contentEditorUrl?: string | null;
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


function buildAttendeeFields(
  profile: AttendeeProfile,
  photoCode: string,
  originalPhotoUrl: string,
  enhancedPhotoUrl: string,
  aiQuote: string
): SitecoreFieldInput[] {
  const fields: SitecoreFieldInput[] = [
    { name: 'Name', value: profile.fullName },
    { name: 'OriginalPhoto', value: originalPhotoUrl },
    { name: 'EnhancedPhoto', value: enhancedPhotoUrl },
    { name: 'AiQuote', value: aiQuote },
    { name: 'PhotoCode', value: photoCode },
  ];

  if (profile.company) fields.push({ name: 'Company', value: profile.company });
  if (profile.companyDescription) {
    fields.push({ name: 'CompanyDescription', value: profile.companyDescription });
  }
  if (profile.role) fields.push({ name: 'Role', value: profile.role });
  if (profile.linkedInUrl) {
    fields.push({ name: 'LinkedIn', value: profile.linkedInUrl });
  }
  if (profile.headline) fields.push({ name: 'Headline', value: profile.headline });

  return fields;
}

function isDuplicateItemNameError(message: string): boolean {
  return /duplicate|already exists|same name|already defined|is already defined/i.test(
    message
  );
}

async function findExistingAttendeeItem(
  parentId: string,
  parentPath: string,
  language: string,
  displayName: string,
  photoCodeName: string
): Promise<SitecoreItemRef | null> {
  const names = [displayName, photoCodeName].filter(Boolean);
  const seen = new Set<string>();

  for (const name of names) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const byPath = await getItemByPath(
      joinSitecoreItemPath(parentPath, name),
      language
    );
    if (byPath) return byPath;

    const byChild = await findChildItemByName(parentId, name, language);
    if (byChild) return byChild;
  }

  return null;
}

function attendeeResult(
  item: { itemId: string; path: string; name: string },
  aiQuote: string,
  created: boolean
): CreateAttendeePageResult {
  return {
    itemId: item.itemId,
    path: item.path,
    name: item.name,
    aiQuote,
    created,
    contentEditorUrl: getSitecoreContentEditorUrl(item.itemId),
  };
}

/** ImageField JSON fallback — template uses Single-Line Text URLs; try plain URL first. */
async function updateFieldWithPhotoFallback(
  itemId: string,
  language: string,
  fieldName: string,
  plainUrl: string
) {
  return await updateSitecoreItemField({
    itemId,
    language,
    name: fieldName,
    value: plainUrl,
  });
}

async function updateAttendeeFields(
  itemId: string,
  language: string,
  fields: SitecoreFieldInput[],
  photoUrls: { original: string; enhanced: string }
) {
  let last: { itemId: string; path: string; name: string } | null = null;

  for (const field of fields) {
    if (field.name === 'OriginalPhoto') {
      last = await updateFieldWithPhotoFallback(
        itemId,
        language,
        field.name,
        photoUrls.original
      );
    } else if (field.name === 'EnhancedPhoto') {
      last = await updateFieldWithPhotoFallback(
        itemId,
        language,
        field.name,
        photoUrls.enhanced
      );
    } else {
      last = await updateSitecoreItemField({
        itemId,
        language,
        name: field.name,
        value: field.value,
      });
    }
  }

  if (!last) {
    throw new Error('No fields were updated');
  }

  return last;
}

/**
 * Creates a new attendee item or updates an existing one at the same path.
 * Item name defaults to full name; duplicates get photo code as item name.
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
  const primaryName =
    displayName.length >= 2 ? displayName : photoCodeName || 'Attendee';

  const photoUrls = {
    original: input.originalPhotoUrl,
    enhanced: input.enhancedPhotoUrl,
  };

  const createAndFill = async (name: string) => {
    const created = await createSitecoreItem({
      name,
      templateId,
      parentId: parent.itemId,
      language,
    });
    return await updateAttendeeFields(created.itemId, language, fields, photoUrls);
  };

  const updateExisting = async (existing: SitecoreItemRef) => {
    const updated = await updateAttendeeFields(
      existing.itemId,
      language,
      fields,
      photoUrls
    );
    return attendeeResult(updated, aiQuote, false);
  };

  const existing = await findExistingAttendeeItem(
    parent.itemId,
    parentPath,
    language,
    displayName,
    photoCodeName
  );
  if (existing) {
    return await updateExisting(existing);
  }

  try {
    const item = await createAndFill(primaryName);
    return attendeeResult(item, aiQuote, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isDuplicateItemNameError(message)) {
      throw error;
    }

    const existingOnRace = await findExistingAttendeeItem(
      parent.itemId,
      parentPath,
      language,
      displayName,
      photoCodeName
    );
    if (existingOnRace) {
      return await updateExisting(existingOnRace);
    }

    if (photoCodeName && photoCodeName !== primaryName) {
      const item = await createAndFill(photoCodeName);
      return attendeeResult(item, aiQuote, true);
    }

    throw error;
  }
}

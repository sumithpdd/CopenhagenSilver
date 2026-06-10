import { bareGuid, normalizeGuid } from '@/lib/sitecore/authoring-api';

/** Deep link to open an item in XM Cloud Content Editor (staff with CM access). */
export function getSitecoreContentEditorUrl(itemId: string): string | null {
  const host = process.env.XMC_HOST?.trim();
  if (!host) return null;

  const id = bareGuid(normalizeGuid(itemId));
  return `https://${host}/sitecore/shell#/sitecore/shell/Applications/Content%20Editor.aspx?sc_lang=en&sc_itemid=${id}`;
}

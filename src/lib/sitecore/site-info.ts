/**
 * Sitecore site context + SilverAttendees folder stats for the home page.
 */

import { getAttendeesParentPath } from '@/lib/sitecore/attendee-profile';
import { isSitecoreConfigured } from '@/lib/core/runtime-mode';
import { authoringGql, getBearerToken } from '@/lib/sitecore/authoring-api';
import { getSitePath } from '@/lib/sitecore/constants';

export interface SitecoreSiteInfo {
  configured: boolean;
  site: {
    name: string;
    path: string;
    itemId: string;
  } | null;
  attendeesFolder: {
    name: string;
    path: string;
    itemId: string;
    totalItems: number;
  } | null;
  error?: string;
}

interface ItemWithChildrenResponse {
  itemId: string;
  name: string;
  path: string;
  displayName?: string;
  children?: {
    nodes?: Array<{ itemId: string; name: string; path: string }>;
  };
}

const SITE_INFO_QUERY = `
query SiteInfo($sitePath: String!, $attendeesPath: String!, $language: String!) {
  site: item(where: { database: "master", path: $sitePath, language: $language }) {
    itemId
    name
    path
    displayName
  }
  attendees: item(where: { database: "master", path: $attendeesPath, language: $language }) {
    itemId
    name
    path
    displayName
    children {
      nodes {
        itemId
        name
        path
      }
    }
  }
}
`;

export async function getSitecoreSiteInfo(
  language = 'en'
): Promise<SitecoreSiteInfo> {
  if (!isSitecoreConfigured()) {
    return { configured: false, site: null, attendeesFolder: null };
  }

  const sitePath = getSitePath();
  const attendeesPath = getAttendeesParentPath();

  try {
    const token = await getBearerToken();
    const result = await authoringGql<{
      site?: ItemWithChildrenResponse;
      attendees?: ItemWithChildrenResponse;
    }>(token, SITE_INFO_QUERY, {
      sitePath,
      attendeesPath,
      language,
    });

    if (result.errors?.length) {
      return {
        configured: true,
        site: null,
        attendeesFolder: null,
        error: result.errors.map((e) => e.message).join('; '),
      };
    }

    const siteItem = result.data?.site;
    const attendeesItem = result.data?.attendees;

    const nodeCount = attendeesItem?.children?.nodes?.length ?? 0;
    const totalItems = nodeCount;

    return {
      configured: true,
      site: siteItem
        ? {
            name: siteItem.displayName || siteItem.name,
            path: siteItem.path,
            itemId: siteItem.itemId,
          }
        : null,
      attendeesFolder: attendeesItem
        ? {
            name: attendeesItem.displayName || attendeesItem.name,
            path: attendeesItem.path,
            itemId: attendeesItem.itemId,
            totalItems,
          }
        : null,
    };
  } catch (error) {
    return {
      configured: true,
      site: null,
      attendeesFolder: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

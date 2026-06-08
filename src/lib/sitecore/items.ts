/**
 * Sitecore Authoring GraphQL — item read/create/update helpers.
 */

import {
  authoringGql,
  bareGuid,
  getBearerToken,
  isGuid,
  normalizeGuid,
} from '@/lib/sitecore/authoring-api';

export interface SitecoreFieldInput {
  name: string;
  value: string;
}

export interface SitecoreItemRef {
  itemId: string;
  name: string;
  path: string;
}

const QUERY_BY_PATH = `
query GetItemByPath($path: String!, $language: String!) {
  item(where: { database: "master", path: $path, language: $language }) {
    itemId
    name
    path
  }
}
`;

const QUERY_BY_ID = `
query GetItemById($itemId: ID!, $language: String!) {
  item(where: { database: "master", itemId: $itemId, language: $language }) {
    itemId
    name
    path
  }
}
`;

const CREATE_ITEM_MUTATION = `
mutation CreateItem(
  $name: String!
  $templateId: ID!
  $parent: ID!
  $language: String!
  $fields: [FieldInput!]
) {
  createItem(
    input: {
      database: "master"
      name: $name
      templateId: $templateId
      parent: $parent
      language: $language
      fields: $fields
    }
  ) {
    item {
      itemId
      name
      path
    }
  }
}
`;

const UPDATE_ITEM_MUTATION = `
mutation UpdateItem($itemId: ID!, $language: String!, $fields: [FieldInput!]) {
  updateItem(
    input: {
      itemId: $itemId
      language: $language
      version: 1
      fields: $fields
    }
  ) {
    item {
      itemId
      name
      path
    }
  }
}
`;

/** Sitecore item names cannot contain these characters. */
export function sanitizeSitecoreItemName(name: string): string {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 100) || 'Attendee';
}

export async function getItemByPath(
  path: string,
  language = 'en'
): Promise<SitecoreItemRef | null> {
  const token = await getBearerToken();
  const result = await authoringGql<{ item?: SitecoreItemRef }>(
    token,
    QUERY_BY_PATH,
    { path, language }
  );

  if (result.errors?.length || !result.data?.item) {
    return null;
  }

  const item = result.data.item;
  return {
    itemId: normalizeGuid(item.itemId),
    name: item.name,
    path: item.path,
  };
}

export async function getItemByLookup(
  lookup: string,
  language = 'en'
): Promise<SitecoreItemRef | null> {
  const token = await getBearerToken();
  const byId = isGuid(lookup);
  const result = await authoringGql<{ item?: SitecoreItemRef }>(
    token,
    byId ? QUERY_BY_ID : QUERY_BY_PATH,
    byId
      ? { itemId: bareGuid(normalizeGuid(lookup)), language }
      : { path: lookup, language }
  );

  if (result.errors?.length || !result.data?.item) {
    return null;
  }

  const item = result.data.item;
  return {
    itemId: normalizeGuid(item.itemId),
    name: item.name,
    path: item.path,
  };
}

export async function createSitecoreItem(options: {
  name: string;
  templateId: string;
  parentId: string;
  language?: string;
  fields: SitecoreFieldInput[];
}): Promise<SitecoreItemRef> {
  const token = await getBearerToken();
  const language = options.language ?? 'en';

  const result = await authoringGql<{
    createItem?: { item?: SitecoreItemRef };
  }>(token, CREATE_ITEM_MUTATION, {
    name: sanitizeSitecoreItemName(options.name),
    templateId: bareGuid(normalizeGuid(options.templateId)),
    parent: bareGuid(normalizeGuid(options.parentId)),
    language,
    fields: options.fields,
  });

  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join('; '));
  }

  const item = result.data?.createItem?.item;
  if (!item) {
    throw new Error('createItem returned no item');
  }

  return {
    itemId: normalizeGuid(item.itemId),
    name: item.name,
    path: item.path,
  };
}

export async function updateSitecoreItem(options: {
  itemId: string;
  language?: string;
  fields: SitecoreFieldInput[];
}): Promise<SitecoreItemRef> {
  const token = await getBearerToken();
  const language = options.language ?? 'en';

  const result = await authoringGql<{
    updateItem?: { item?: SitecoreItemRef };
  }>(token, UPDATE_ITEM_MUTATION, {
    itemId: bareGuid(normalizeGuid(options.itemId)),
    language,
    fields: options.fields,
  });

  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join('; '));
  }

  const item = result.data?.updateItem?.item;
  if (!item) {
    throw new Error('updateItem returned no item');
  }

  return {
    itemId: normalizeGuid(item.itemId),
    name: item.name,
    path: item.path,
  };
}

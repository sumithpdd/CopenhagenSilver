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

const QUERY_CHILDREN = `
query GetItemChildren($itemId: ID!, $language: String!) {
  item(where: { database: "master", itemId: $itemId, language: $language }) {
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

const CREATE_ITEM_MUTATION = `
mutation CreateItem(
  $name: String!
  $templateId: ID!
  $parent: ID!
  $language: String!
) {
  createItem(
    input: {
      database: "master"
      name: $name
      templateId: $templateId
      parent: $parent
      language: $language
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

/** One field per request — avoids batch `fields` variable type issues on some CM builds. */
const UPDATE_FIELD_MUTATION = `
mutation UpdateField(
  $itemId: ID!
  $language: String!
  $fieldName: String!
  $value: String!
) {
  updateItem(
    input: {
      database: "master"
      itemId: $itemId
      language: $language
      fields: [{ name: $fieldName, value: $value }]
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

/** Sitecore InvalidItemNameChars: \ / : * ? " < > | [ ] — plus spaces (not allowed in item names). */
const INVALID_ITEM_NAME_CHAR_RE = /[\\/:*?"<>|[\]]/g;

/**
 * Produce a valid Sitecore item name — letters and digits only.
 * Strips spaces, Sitecore invalid chars (\\ / : * ? " < > | [ ]), and . , - $ _ etc.
 * "Federico Mujica Cazenave" → "FedericoMujicaCazenave"
 * "Dr. Smith-Jones" → "DrSmithJones"
 * "SILVER-MQ7Z7Q" → "SILVERMQ7Z7Q"
 */
export function sanitizeSitecoreItemName(name: string): string {
  const cleaned = name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(INVALID_ITEM_NAME_CHAR_RE, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 100);

  return cleaned || 'Attendee';
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

export function joinSitecoreItemPath(parentPath: string, itemName: string): string {
  const parent = parentPath.replace(/\/+$/, '');
  const name = itemName.replace(/^\/+/, '');
  return `${parent}/${name}`;
}

/** Find a direct child by item name (case-insensitive). */
export async function findChildItemByName(
  parentId: string,
  name: string,
  language = 'en'
): Promise<SitecoreItemRef | null> {
  const token = await getBearerToken();
  const target = sanitizeSitecoreItemName(name).toLowerCase();

  const result = await authoringGql<{
    item?: { children?: { nodes?: SitecoreItemRef[] } };
  }>(token, QUERY_CHILDREN, {
    itemId: bareGuid(normalizeGuid(parentId)),
    language,
  });

  if (result.errors?.length || !result.data?.item?.children?.nodes) {
    return null;
  }

  const match = result.data.item.children.nodes.find(
    (node) => node.name.toLowerCase() === target
  );

  if (!match) {
    return null;
  }

  return {
    itemId: normalizeGuid(match.itemId),
    name: match.name,
    path: match.path,
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

export async function updateSitecoreItemField(options: {
  itemId: string;
  language?: string;
  name: string;
  value: string;
}): Promise<SitecoreItemRef> {
  const token = await getBearerToken();
  const language = options.language ?? 'en';

  const result = await authoringGql<{
    updateItem?: { item?: SitecoreItemRef };
  }>(token, UPDATE_FIELD_MUTATION, {
    itemId: bareGuid(normalizeGuid(options.itemId)),
    language,
    fieldName: options.name,
    value: options.value,
  });

  if (result.errors?.length) {
    throw new Error(
      `Field "${options.name}": ${result.errors.map((e) => e.message).join('; ')}`
    );
  }

  const item = result.data?.updateItem?.item;
  if (!item) {
    throw new Error(`updateItem returned no item for field "${options.name}"`);
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
  if (options.fields.length === 0) {
    throw new Error('No fields to update');
  }

  let last: SitecoreItemRef | null = null;
  for (const field of options.fields) {
    last = await updateSitecoreItemField({
      itemId: options.itemId,
      language: options.language,
      name: field.name,
      value: field.value,
    });
  }

  return last!;
}

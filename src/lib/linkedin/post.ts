/**
 * LinkedIn image post via Assets + UGC Posts API.
 * @see https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
 */

export async function uploadLinkedInImage(
  accessToken: string,
  personId: string,
  imageBuffer: Buffer
): Promise<string> {
  const owner = `urn:li:person:${personId}`;

  const registerRes = await fetch(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    }
  );

  if (!registerRes.ok) {
    const body = await registerRes.text();
    throw new Error(`LinkedIn registerUpload failed (${registerRes.status}): ${body}`);
  }

  const registerData = (await registerRes.json()) as {
    value?: {
      asset?: string;
      uploadMechanism?: {
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'?: {
          uploadUrl?: string;
        };
      };
    };
  };

  const uploadUrl =
    registerData.value?.uploadMechanism?.[
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
    ]?.uploadUrl;
  const asset = registerData.value?.asset;

  if (!uploadUrl || !asset) {
    throw new Error('LinkedIn registerUpload returned incomplete data');
  }

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
    },
    body: new Uint8Array(imageBuffer),
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    throw new Error(`LinkedIn image upload failed (${uploadRes.status}): ${body}`);
  }

  return asset;
}

export async function publishLinkedInImagePost(
  accessToken: string,
  personId: string,
  assetUrn: string,
  text: string
): Promise<{ id: string }> {
  const author = `urn:li:person:${personId}`;

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              description: { text: 'Sitecore Silver Celebration — Copenhagen 2026' },
              media: assetUrn,
              title: { text: 'Sitecore Silver Photo Booth' },
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn ugcPosts failed (${res.status}): ${body}`);
  }

  const id = res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id') || 'posted';
  return { id };
}

export function decodeImageToBuffer(image: string): Buffer {
  const base64 = image.includes(',') ? image.split(',')[1] : image;
  return Buffer.from(base64, 'base64');
}

/** Resolve image bytes from base64 data URL or a public HTTPS URL (e.g. Firebase Storage). */
export async function resolveImageBuffer(
  image?: string,
  imageUrl?: string
): Promise<Buffer> {
  if (imageUrl?.trim()) {
    const res = await fetch(imageUrl.trim());
    if (!res.ok) {
      throw new Error(`Failed to fetch image (${res.status})`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  if (image?.trim()) {
    const buffer = decodeImageToBuffer(image);
    if (buffer.length < 1000) {
      throw new Error('Invalid image data');
    }
    return buffer;
  }

  throw new Error('image or imageUrl is required');
}

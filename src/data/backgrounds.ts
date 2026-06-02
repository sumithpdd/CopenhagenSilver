/**
 * Background options for Sitecore Silver Photo Booth
 * Digital Swag + Content Hub celebration imagery
 */

import { Background } from '@/types';
import { BRAND_ASSETS } from '@/lib/branding';

export const backgrounds: Background[] = [
  {
    id: 'silver-curtain',
    name: 'Silver Celebration',
    description: 'Official event backdrop — dark curtain texture',
    imageUrl: BRAND_ASSETS.pageBackdrop,
    category: 'heritage',
  },
  {
    id: 'tivoli',
    name: 'Tivoli Copenhagen',
    description:
      'Historic Tivoli Gardens and Copenhagen skyline — Silver Celebration venue in Denmark',
    imageUrl: BRAND_ASSETS.tivoliCopenhagen,
    category: 'celebration',
  },
  {
    id: 'desktop-v3',
    name: 'Silver Desktop',
    description: 'Official celebration backdrop — Digital Swag',
    imageUrl: BRAND_ASSETS.desktopBackdropV3,
    category: 'heritage',
  },
  {
    id: 'desktop',
    name: 'Silver Stage',
    description: 'Full-stage video backdrop with logo',
    imageUrl: BRAND_ASSETS.desktopBackdrop,
    category: 'heritage',
  },
  {
    id: 'desktop-v2',
    name: 'Silver Spotlight',
    description: 'Dramatic silver lighting — event style',
    imageUrl: BRAND_ASSETS.desktopBackdropV2,
    category: 'innovation',
  },
  {
    id: 'linkedin-v1',
    name: 'Community Mosaic',
    description: 'LinkedIn celebration cover — together in silver',
    imageUrl: BRAND_ASSETS.linkedinCoverV1,
    category: 'celebration',
  },
  {
    id: 'linkedin-v2',
    name: 'Silver Horizon',
    description: 'LinkedIn cover — 25 years forward',
    imageUrl: BRAND_ASSETS.linkedinCoverV2,
    category: 'celebration',
  },
  {
    id: 'heritage',
    name: 'Silver Curtain',
    description: 'Classic curtain texture — Nordic elegance',
    imageUrl: BRAND_ASSETS.curtainTexture,
    category: 'heritage',
  },
  {
    id: 'innovation',
    name: 'Future Ready',
    description: 'Composable DXP and AI innovation',
    imageUrl: BRAND_ASSETS.desktopBackdropV2,
    category: 'innovation',
  },
];

export function getBackgroundById(id: string): Background | undefined {
  return backgrounds.find((bg) => bg.id === id);
}

export function getBackgroundsByCategory(
  category: 'heritage' | 'celebration' | 'innovation'
): Background[] {
  return backgrounds.filter((bg) => bg.category === category);
}

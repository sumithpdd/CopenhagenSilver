/**
 * Background options for Sitecore Silver Photo Booth
 * Each background represents a theme from the 25-year celebration
 */

import { Background } from '@/types';

export const backgrounds: Background[] = [
  {
    id: 'heritage',
    name: 'Sitecore Heritage',
    description: '25 years of innovation from Denmark',
    imageUrl: '/heritage.svg',
    category: 'heritage',
  },
  {
    id: 'celebration',
    name: 'Celebrating Together',
    description: 'Community and milestone moment',
    imageUrl: '/celebration.svg',
    category: 'celebration',
  },
  {
    id: 'innovation',
    name: 'Future Ready',
    description: 'AI and digital innovation',
    imageUrl: '/innovation.svg',
    category: 'innovation',
  },
  {
    id: 'your-story',
    name: 'Your Story',
    description: 'Be part of Sitecore\'s 25-year legacy',
    imageUrl: '/your-story.svg',
    category: 'celebration',
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

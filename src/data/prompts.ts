/**
 * Photo prompts for Sitecore Silver AI transformation
 * Organized by category related to Sitecore's 25-year celebration
 */

import { PhotoPrompt } from '@/types';

export const prompts: PhotoPrompt[] = [
  // Heritage Category - Celebrating 25 years
  {
    id: 'heritage-25-years',
    title: '25 Years Strong',
    description: 'Celebrating 25 years of Sitecore',
    fullPrompt:
      'Create a celebratory image showing 25 years of Sitecore innovation. Include silver anniversary elements, Danish heritage symbols, Sitecore logos, and the person positioned as part of this milestone celebration. Show innovation, growth, and success over the years.',
    category: 'heritage',
    emoji: '🎉',
  },
  {
    id: 'heritage-denmark',
    title: 'From Denmark to the World',
    description: 'Sitecore roots in Denmark',
    fullPrompt:
      'Position the person with Danish landmarks and global connections. Show the journey from Denmark (Copenhagen, heritage buildings) expanding to worldwide reach. Include technology symbols, growth arrows, and international elements.',
    category: 'heritage',
    emoji: '🌍',
  },
  {
    id: 'heritage-founders',
    title: 'Meeting the Founders',
    description: 'Honoring Sitecore founders',
    fullPrompt:
      'Create an image showing respect and admiration for Sitecore founders. Include historical Sitecore imagery from 2001, modern technology, and the person alongside symbolic founder presence. Show legacy and vision.',
    category: 'heritage',
    emoji: '👥',
  },

  // Celebration Category
  {
    id: 'celebration-milestone',
    title: 'Milestone Moment',
    description: 'Celebrating this historic moment',
    fullPrompt:
      'Create a festive celebration scene. Include confetti, milestone markers, Sitecore branding, Copenhagen setting (Tivoli visible), champagne/celebration elements, and the person as central to this celebration moment.',
    category: 'celebration',
    emoji: '🥳',
  },
  {
    id: 'celebration-community',
    title: 'Celebrating with Customers',
    description: 'Together with the community',
    fullPrompt:
      'Show the person surrounded by a diverse community of Sitecore customers and partners. Include collaboration symbols, connected nodes, global representation, Sitecore logos, and a sense of unity and shared success.',
    category: 'celebration',
    emoji: '🤝',
  },
  {
    id: 'celebration-together',
    title: 'Homecoming',
    description: '"Homecoming to where it all began"',
    fullPrompt:
      'Create a homecoming atmosphere showing return to Copenhagen, Tivoli setting, Danish cultural elements mixed with modern tech. Show nostalgia, return, and forward momentum. Include the person as part of this journey.',
    category: 'celebration',
    emoji: '🏠',
  },

  // Innovation Category - Future forward
  {
    id: 'innovation-ai',
    title: 'AI-Powered Future',
    description: 'Building with AI and innovation',
    fullPrompt:
      'Show the person as an AI pioneer. Include futuristic AI elements, neural networks, holographic displays, machine learning visualizations, Sitecore branding, and innovation symbols. Display cutting-edge technology and digital transformation.',
    category: 'innovation',
    emoji: '🤖',
  },
  {
    id: 'innovation-digital',
    title: 'Digital Transformation Pioneer',
    description: 'Leading digital change',
    fullPrompt:
      'Position the person at the forefront of digital transformation. Include cloud infrastructure, digital ecosystems, connected systems, data visualization, and transformative technology. Show leadership in digital innovation.',
    category: 'innovation',
    emoji: '🚀',
  },
  {
    id: 'innovation-next-gen',
    title: 'Next Generation Sitecore',
    description: 'Building the future',
    fullPrompt:
      'Create a forward-looking image with next-generation technology. Include modern UI/UX elements, advanced analytics dashboards, AI integration, cloud infrastructure, and the person as builder of the future.',
    category: 'innovation',
    emoji: '✨',
  },
  {
    id: 'innovation-experiences',
    title: 'Experiencing Digital Excellence',
    description: 'Crafting amazing experiences',
    fullPrompt:
      'Show the person creating exceptional digital experiences. Include beautiful UI/UX elements, seamless interactions, personalized experiences, customer satisfaction symbols, and modern digital excellence.',
    category: 'innovation',
    emoji: '💎',
  },

  // Fun Category
  {
    id: 'fun-superhero',
    title: 'Sitecore Superhero',
    description: 'You are a tech superhero',
    fullPrompt:
      'Transform the person into a Sitecore superhero with cape and powers. Include silver/blue Sitecore colors, heroic pose, city skyline (Copenhagen), flying through air, saving the digital day, and heroic lighting.',
    category: 'fun',
    emoji: '🦸',
  },
  {
    id: 'fun-developer',
    title: 'Developer of the Day',
    description: 'Star developer moment',
    fullPrompt:
      'Show the person as celebrated developer. Include developer tools, code, coffee cups, awards, applause, celebration, success indicators, and recognition. Show mastery and achievement.',
    category: 'fun',
    emoji: '⭐',
  },
];

export function getPromptById(id: string): PhotoPrompt | undefined {
  return prompts.find((p) => p.id === id);
}

export function getPromptsByCategory(
  category: 'heritage' | 'celebration' | 'innovation' | 'fun'
): PhotoPrompt[] {
  return prompts.filter((p) => p.category === category);
}

export function getAllCategories(): string[] {
  const categories = prompts.map((p) => p.category);
  return Array.from(new Set(categories)).sort();
}

export function getPromptsBySearch(query: string): PhotoPrompt[] {
  const lowerQuery = query.toLowerCase();
  return prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}

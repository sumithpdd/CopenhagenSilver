/**
 * Dummy milestone facts for the Sitecore Silver 25-year celebration keepsake page.
 * Replace with CMS or official copy when available.
 */

export interface SitecoreMilestone {
  year: number;
  title: string;
  fact: string;
  category: 'founding' | 'product' | 'community' | 'innovation' | 'global';
}

export const sitecoreMilestones: SitecoreMilestone[] = [
  {
    year: 2001,
    title: 'Founded in Denmark',
    fact: 'Sitecore began in Copenhagen with a vision to help brands deliver connected digital experiences.',
    category: 'founding',
  },
  {
    year: 2006,
    title: 'First major enterprise adopters',
    fact: 'Global brands started standardizing on Sitecore for multilingual, multi-site web platforms.',
    category: 'global',
  },
  {
    year: 2010,
    title: 'DXP vision takes shape',
    fact: 'Sitecore expanded beyond CMS into personalization and marketing automation foundations.',
    category: 'product',
  },
  {
    year: 2014,
    title: 'Helix architecture',
    fact: 'Helix became the community blueprint for scalable, maintainable Sitecore implementations.',
    category: 'community',
  },
  {
    year: 2016,
    title: 'Experience Platform momentum',
    fact: 'The Experience Platform united content, data, and delivery for true customer journeys.',
    category: 'product',
  },
  {
    year: 2018,
    title: 'Partner ecosystem growth',
    fact: 'Solution partners and MVPs worldwide formed one of the strongest enterprise CMS communities.',
    category: 'community',
  },
  {
    year: 2020,
    title: 'Cloud and composable shift',
    fact: 'Sitecore accelerated SaaS offerings and headless APIs for modern martech stacks.',
    category: 'innovation',
  },
  {
    year: 2022,
    title: 'XM Cloud & composable DXP',
    fact: 'XM Cloud brought faster releases and Vercel-friendly workflows for digital teams.',
    category: 'innovation',
  },
  {
    year: 2024,
    title: 'AI across the platform',
    fact: 'Generative and predictive AI capabilities were woven into content, search, and operations.',
    category: 'innovation',
  },
  {
    year: 2025,
    title: 'Sitecore Stream',
    fact: 'Stream unified marketer workflows with AI-assisted content creation and orchestration.',
    category: 'product',
  },
  {
    year: 2026,
    title: 'Silver Anniversary',
    fact: 'Twenty-five years of innovation celebrated in Copenhagen — where the journey began.',
    category: 'founding',
  },
  {
    year: 2026,
    title: 'Tivoli gathering',
    fact: 'Customers, partners, and Sitecorians meet at Tivoli for the Silver Celebration event.',
    category: 'community',
  },
];

/** Pick a stable subset of facts for a session (deterministic from session id). */
export function pickFactsForSession(sessionId: string, count = 5): SitecoreMilestone[] {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash << 5) - hash + sessionId.charCodeAt(i);
    hash |= 0;
  }
  const sorted = [...sitecoreMilestones];
  const start = Math.abs(hash) % sorted.length;
  const picked: SitecoreMilestone[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(sorted[(start + i) % sorted.length]);
  }
  return picked;
}

export const celebrationTaglines = [
  'From Copenhagen to the world — 25 years of digital experience leadership.',
  'Heritage, community, and innovation — captured in silver.',
  'Thank you for being part of the Sitecore story.',
];

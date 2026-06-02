/**
 * SitecoreAI platform story — SitecoreAI is one word per sitecore.com/platform
 */

export interface SitecoreAiCapability {
  id: string;
  step: number;
  product: string;
  tagline: string;
  body: string;
  accent: 'cms' | 'rag' | 'data';
}

export const sitecoreAiCapabilities: SitecoreAiCapability[] = [
  {
    id: 'cms',
    step: 1,
    product: 'SitecoreAI CMS',
    tagline: 'Right story. Right moment. Every time.',
    body:
      'Shape trusted digital experiences at scale—so every visitor discovers the information they need, exactly when and where it matters.',
    accent: 'cms',
  },
  {
    id: 'rag',
    step: 2,
    product: 'SitecoreAI Agentic RAG',
    tagline: 'Ask boldly. Answer with proof.',
    body:
      'Turn complex knowledge bases into grounded, context-aware AI experiences—so teams explore ideas faster without losing accuracy or control.',
    accent: 'rag',
  },
  {
    id: 'data',
    step: 3,
    product: 'SitecoreAI Data Platform',
    tagline: 'Connect the dots. Govern the truth.',
    body:
      'Unify data across systems with clarity and guardrails—boosting visibility, readiness, and the confidence behind every decision.',
    accent: 'data',
  },
];

export const sitecoreAiFlowClosing = {
  headline: 'Create · Understand · Decide',
  body:
    'When content, conversation, and data move as one, organizations don’t just collect knowledge—they activate it. Insight becomes action. Action becomes impact you can measure.',
};

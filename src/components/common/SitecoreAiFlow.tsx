'use client';

import {
  sitecoreAiCapabilities,
  sitecoreAiFlowClosing,
} from '@/data/sitecore-ai-capabilities';

const accentStyles = {
  cms: 'sitecore-ai-flow__card--cms',
  rag: 'sitecore-ai-flow__card--rag',
  data: 'sitecore-ai-flow__card--data',
} as const;

export function SitecoreAiFlow() {
  return (
    <section
      className="sitecore-ai-flow w-full max-w-5xl mx-auto mt-12 md:mt-16 text-left"
      aria-labelledby="sitecore-ai-flow-title"
    >
      <header className="text-center mb-10 md:mb-12 px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-muted mb-2">
          The connected platform
        </p>
        <h2 id="sitecore-ai-flow-title" className="page-title mb-3">
          Three engines. One intelligent journey.
        </h2>
        <p className="page-subtitle max-w-2xl mx-auto">
          From trusted content to grounded answers and governed data—see how{' '}
          <span className="text-white font-semibold">SitecoreAI</span> helps teams move in
          sync.
        </p>
      </header>

      {/* Desktop: horizontal flow */}
      <div className="hidden md:block relative px-4">
        <div className="sitecore-ai-flow__track" aria-hidden>
          <div className="sitecore-ai-flow__track-line" />
          {sitecoreAiCapabilities.map((cap, i) => (
            <div
              key={cap.id}
              className="sitecore-ai-flow__track-node"
              style={{ left: `${16.66 + i * 33.33}%` }}
            >
              <span className="sitecore-ai-flow__track-dot" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 relative z-[1]">
          {sitecoreAiCapabilities.map((cap) => (
            <CapabilityCard key={cap.id} cap={cap} />
          ))}
        </div>
      </div>

      {/* Mobile: vertical flow */}
      <div className="md:hidden px-2 space-y-0">
        {sitecoreAiCapabilities.map((cap, i) => (
          <div key={cap.id} className="relative">
            {i > 0 && (
              <div className="sitecore-ai-flow__v-connector mx-auto" aria-hidden />
            )}
            <CapabilityCard cap={cap} />
          </div>
        ))}
      </div>

      <div className="sitecore-ai-flow__closing brand-card mt-10 md:mt-12 p-6 md:p-8 text-center mx-2 md:mx-0">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-muted mb-2">
          {sitecoreAiFlowClosing.headline}
        </p>
        <p className="text-base md:text-lg text-silver-200 leading-relaxed max-w-3xl mx-auto">
          {sitecoreAiFlowClosing.body}
        </p>
      </div>
    </section>
  );
}

function CapabilityCard({
  cap,
}: {
  cap: (typeof sitecoreAiCapabilities)[number];
}) {
  return (
    <article
      className={`sitecore-ai-flow__card brand-card p-5 md:p-6 h-full flex flex-col ${accentStyles[cap.accent]}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="sitecore-ai-flow__step" aria-hidden>
          {cap.step}
        </span>
        <div className="h-px flex-1 sitecore-ai-flow__card-divider" aria-hidden />
      </div>
      <h3 className="text-base md:text-lg font-bold text-white mb-1 leading-snug">
        {cap.product}
      </h3>
      <p className="text-sm font-medium text-accent-silver mb-3">{cap.tagline}</p>
      <p className="text-sm text-sc-muted leading-relaxed flex-1">{cap.body}</p>
    </article>
  );
}

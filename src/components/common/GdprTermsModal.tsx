'use client';

import { GDPR_SECTIONS } from '@/lib/gdpr';

interface GdprTermsModalProps {
  open: boolean;
  onClose: () => void;
}

export function GdprTermsModal({ open, onClose }: GdprTermsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gdpr-title"
      onClick={onClose}
    >
      <div
        className="brand-card max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="gdpr-title" className="text-xl font-bold silver-accent mb-4">
          Terms & Privacy Notice
        </h2>
        <p className="text-sm text-silver-400 mb-6">
          Sitecore Silver Celebration · Copenhagen 2026 · AI Photo Booth
        </p>
        <div className="space-y-5 text-sm text-silver-300">
          {GDPR_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-white mb-1">{section.title}</h3>
              <p className="leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} className="btn-silver w-full mt-8">
          Close
        </button>
      </div>
    </div>
  );
}

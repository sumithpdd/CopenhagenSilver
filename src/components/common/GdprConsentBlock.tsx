'use client';

import { useState } from 'react';
import {
  GDPR_CHECKBOX_GALLERY,
  GDPR_CHECKBOX_TERMS,
  GDPR_SUMMARY,
} from '@/lib/gdpr';
import { GdprTermsModal } from './GdprTermsModal';

interface GdprConsentBlockProps {
  termsAccepted: boolean;
  galleryShare: boolean;
  onTermsChange: (v: boolean) => void;
  onGalleryChange: (v: boolean) => void;
}

export function GdprConsentBlock({
  termsAccepted,
  galleryShare,
  onTermsChange,
  onGalleryChange,
}: GdprConsentBlockProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-4 text-sm">
      <p className="text-silver-400 leading-relaxed">{GDPR_SUMMARY}</p>

      <label className="flex gap-3 items-start cursor-pointer group">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[#c9b4cc] shrink-0"
        />
        <span className="text-silver-200 group-hover:text-white transition">
          {GDPR_CHECKBOX_TERMS}{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setModalOpen(true);
            }}
            className="link-sitecore"
          >
            Read full notice
          </button>
        </span>
      </label>

      <label className="flex gap-3 items-start cursor-pointer group">
        <input
          type="checkbox"
          checked={galleryShare}
          onChange={(e) => onGalleryChange(e.target.checked)}
          disabled={!termsAccepted}
          className="mt-1 w-4 h-4 accent-[#c9b4cc] shrink-0 disabled:opacity-40"
        />
        <span
          className={`text-silver-200 transition ${!termsAccepted ? 'opacity-50' : 'group-hover:text-white'}`}
        >
          {GDPR_CHECKBOX_GALLERY}
        </span>
      </label>

      <GdprTermsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

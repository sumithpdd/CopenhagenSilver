'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { userInputSchema, type UserInputFormData } from '@/lib/validators';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { BoothLayout } from '@/components/common/BoothLayout';
import { GdprConsentBlock } from '@/components/common/GdprConsentBlock';
import { FormField } from '@/components/ui/FormField';
import { IconArrowRight, IconMail, IconSparkles, IconUser } from '@/components/icons/BoothIcons';
import { GDPR_FOOTER } from '@/lib/gdpr';
import Link from 'next/link';

export default function InputPage() {
  const router = useRouter();
  const initializeSession = usePhotoBoothStore((state) => state.initializeSession);
  const setConsent = usePhotoBoothStore((state) => state.setConsent);
  const consentTermsAccepted = usePhotoBoothStore((state) => state.consentTermsAccepted);
  const consentGalleryShare = usePhotoBoothStore((state) => state.consentGalleryShare);

  const [termsAccepted, setTermsAccepted] = useState(consentTermsAccepted);
  const [galleryShare, setGalleryShare] = useState(consentGalleryShare);
  const [consentError, setConsentError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserInputFormData>({
    resolver: zodResolver(userInputSchema),
  });

  const onSubmit = (data: UserInputFormData) => {
    if (!termsAccepted) {
      setConsentError('Please accept the Terms & Privacy Notice to continue.');
      return;
    }
    setConsentError(null);
    setConsent(termsAccepted, galleryShare);
    initializeSession(data.userName, data.userEmail);
    router.push('/camera');
  };

  return (
    <BoothLayout>
      <div className="flex items-center justify-center p-4 py-10 md:py-14">
        <div className="w-full max-w-lg">
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <span className="hero-stat-pill inline-flex">
                <IconSparkles size={16} />
                Copenhagen · 2026
              </span>
              <h2 className="page-title silver-accent">Welcome to the Booth</h2>
              <p className="page-subtitle">
                Create your Sitecore Silver memory at Tivoli
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="booth-form-card space-y-6">
              <FormField
                {...register('userName')}
                label="What's your name? *"
                icon={<IconUser size={20} />}
                type="text"
                placeholder="Enter your name"
                autoFocus
                error={errors.userName?.message}
              />

              <FormField
                {...register('userEmail')}
                label="Email (optional)"
                icon={<IconMail size={20} />}
                type="email"
                placeholder="your.email@example.com"
                error={errors.userEmail?.message}
                hint="For sharing or printing your keepsake"
              />

              <div className="border-t border-white/10 pt-6">
                <GdprConsentBlock
                  termsAccepted={termsAccepted}
                  galleryShare={galleryShare}
                  onTermsChange={(v) => {
                    setTermsAccepted(v);
                    if (!v) setGalleryShare(false);
                    setConsentError(null);
                  }}
                  onGalleryChange={setGalleryShare}
                />
                {consentError && (
                  <p className="mt-3 text-[#ff9a94] text-sm font-medium">{consentError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-sitecore-red btn-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Getting Ready...' : 'Continue to Camera'}
                {!isSubmitting && <IconArrowRight size={20} />}
              </button>
            </form>

            <p className="text-center text-sm text-sc-muted leading-relaxed">
              {GDPR_FOOTER}{' '}
              <Link href="/privacy" className="link-sitecore">
                Full privacy notice
              </Link>
            </p>
          </div>
        </div>
      </div>
    </BoothLayout>
  );
}

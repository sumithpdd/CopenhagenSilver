'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { downloadImage, printPhoto } from '@/lib/photo-actions';
import { fetchCompositedPhoto } from '@/lib/composit-client';
import { isApiSessionError } from '@/lib/core/api-client';
import { BoothLayout } from '@/components/common/BoothLayout';
import { SocialSharePanel } from '@/components/photo-booth/SocialSharePanel';
function ResultSocialShare({
  compositedPhoto,
  userName,
  photoCode,
  promptTitle,
  backgroundName,
  company,
  role,
}: {
  compositedPhoto: string;
  userName: string;
  photoCode: string;
  promptTitle: string;
  backgroundName: string;
  company?: string;
  role?: string;
}) {
  return (
    <Suspense fallback={null}>
      <SocialSharePanel
        compositedPhoto={compositedPhoto}
        userName={userName}
        photoCode={photoCode}
        promptTitle={promptTitle}
        backgroundName={backgroundName}
        company={company}
        role={role}
        returnPath="/result"
      />
    </Suspense>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((state) => state.session);
  const capturedPhoto = usePhotoBoothStore((state) => state.capturedPhoto);
  const compositedPhotoUrl = usePhotoBoothStore((state) => state.compositedPhotoUrl);
  const storedPhotoCode = usePhotoBoothStore((state) => state.photoCode);
  const sitecoreAttendeePage = usePhotoBoothStore((state) => state.sitecoreAttendeePage);
  const sitecoreSyncError = usePhotoBoothStore((state) => state.sitecoreSyncError);
  const selectedBackground = usePhotoBoothStore((state) => state.selectedBackground);
  const selectedPrompt = usePhotoBoothStore((state) => state.selectedPrompt);
  const attendeeProfile = usePhotoBoothStore((state) => state.attendeeProfile);
  const resetSession = usePhotoBoothStore((state) => state.resetSession);
  const setCompositedPreview = usePhotoBoothStore((state) => state.setCompositedPreview);

  const [fallbackPhotoCode] = useState(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SILVER${timestamp}${random}`;
  });
  const photoCode = storedPhotoCode ?? fallbackPhotoCode;

  const originalPhoto = capturedPhoto;
  const compositedPhoto = compositedPhotoUrl ?? capturedPhoto;
  const hasBoth =
    Boolean(capturedPhoto && compositedPhotoUrl && capturedPhoto !== compositedPhotoUrl);

  const [downloading, setDownloading] = useState<'original' | 'composite' | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !compositedPhoto || !selectedBackground || !selectedPrompt) {
      router.push('/input');
    }
  }, [session, compositedPhoto, selectedBackground, selectedPrompt, router]);

  const handleCreateNew = () => {
    resetSession();
    router.push('/input');
  };

  const handleDownload = async (type: 'original' | 'composite') => {
    setActionError(null);
    setDownloading(type);
    try {
      const src = type === 'original' ? originalPhoto! : compositedPhoto!;
      await downloadImage(src, `sitecore-silver-${photoCode}-${type}.jpg`);
    } catch {
      setActionError('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handlePrint = () => {
    printPhoto(compositedPhoto!, { code: photoCode });
  };

  const handleRegenerate = async () => {
    if (!capturedPhoto || !selectedBackground || !selectedPrompt) return;
    setActionError(null);
    setRegenerating(true);
    try {
      const next = await fetchCompositedPhoto({
        photo: capturedPhoto,
        background: selectedBackground,
        prompt: selectedPrompt,
      });
      setCompositedPreview(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Regeneration failed';
      setActionError(
        isApiSessionError(message)
          ? `${message} — try again in a moment.`
          : message
      );
    } finally {
      setRegenerating(false);
    }
  };

  if (!session || !compositedPhoto || !selectedBackground || !selectedPrompt)
    return null;

  return (
    <BoothLayout>
      <div className="flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-4xl space-y-8 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 silver-accent">
              Your Photo: {photoCode}
            </h2>
            <p className="text-silver-300">
              Share this code to find your photo in the gallery
            </p>
          </div>

          <div
            className={`grid gap-6 ${hasBoth ? 'md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}
          >
            {hasBoth && originalPhoto && (
              <div className="brand-card p-4 space-y-3">
                <p className="text-sm font-bold text-silver-400 uppercase tracking-wide text-center">
                  Original
                </p>
                <img
                  src={originalPhoto}
                  alt="Your original photo"
                  className="w-full rounded-lg border-2 border-silver-500/50 object-contain max-h-[420px] bg-black mx-auto"
                />
                <button
                  type="button"
                  disabled={downloading !== null}
                  onClick={() => handleDownload('original')}
                  className="w-full btn-silver-outline text-sm py-2 disabled:opacity-50"
                >
                  {downloading === 'original' ? 'Downloading…' : '⬇️ Download Original'}
                </button>
              </div>
            )}

            <div className="brand-card p-4 space-y-3 relative">
              {regenerating && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-black/70 gap-3">
                  <div className="w-12 h-12 border-4 border-silver-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-silver-200 text-sm">Regenerating AI photo…</p>
                </div>
              )}
              <p className="text-sm font-bold text-silver-400 uppercase tracking-wide text-center">
                {hasBoth ? 'AI Enhanced' : 'Your Photo'}
              </p>
              <p className="text-xs text-silver-500 text-center">
                Portrait · 100×148 mm · ready for SELPHY CP1300
              </p>
              <img
                src={compositedPhoto}
                alt="Your AI-transformed photo"
                className="w-full max-w-sm mx-auto rounded-lg border-4 border-silver-400 object-contain aspect-[100/148] bg-white"
              />
              <button
                type="button"
                disabled={downloading !== null || regenerating}
                onClick={() => void handleRegenerate()}
                className="w-full btn-silver-outline text-sm py-2 disabled:opacity-50"
              >
                {regenerating ? 'Regenerating…' : '🔄 Regenerate AI Photo'}
              </button>
              <p className="text-xs text-silver-500 text-center">
                Not happy with the result? Regenerate until you are ready to print.
              </p>
              <button
                type="button"
                disabled={downloading !== null || regenerating}
                onClick={() => handleDownload('composite')}
                className="w-full btn-silver text-sm py-2 disabled:opacity-50"
              >
                {downloading === 'composite' ? 'Downloading…' : '⬇️ Download Enhanced'}
              </button>
            </div>
          </div>

          {actionError && (
            <p className="text-red-400 text-sm text-center">{actionError}</p>
          )}

          <ResultSocialShare
            compositedPhoto={compositedPhoto}
            userName={session.userName}
            photoCode={photoCode}
            promptTitle={selectedPrompt.title}
            backgroundName={selectedBackground.name}
            company={attendeeProfile?.company}
            role={attendeeProfile?.role}
          />

          {sitecoreAttendeePage && (
            <div className="brand-card p-6 space-y-3 text-sm">
              <p className="text-silver-400 font-semibold uppercase tracking-wide">
                {sitecoreAttendeePage.created ? 'Created in Sitecore' : 'Updated in Sitecore'}
              </p>
              <p className="font-mono text-xs text-silver-300 break-all">
                {sitecoreAttendeePage.path}
              </p>
              {sitecoreAttendeePage.aiQuote && (
                <p className="text-silver-200 italic leading-relaxed">
                  &ldquo;{sitecoreAttendeePage.aiQuote}&rdquo;
                </p>
              )}
              {sitecoreAttendeePage.contentEditorUrl && (
                <a
                  href={sitecoreAttendeePage.contentEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-silver-outline text-xs inline-flex"
                >
                  Open in Content Editor
                </a>
              )}
              <p className="text-silver-500 text-xs">
                Items are in the <strong>master</strong> database — publish the item (and parent
                site) to see it on the live Sitecore site.
              </p>
            </div>
          )}

          {!sitecoreAttendeePage && sitecoreSyncError && (
            <div className="brand-card p-6 space-y-2 text-sm border border-amber-500/40">
              <p className="text-amber-400 font-semibold uppercase tracking-wide">
                Sitecore sync did not complete
              </p>
              <p className="text-silver-300 text-xs break-words">{sitecoreSyncError}</p>
              <p className="text-silver-500 text-xs">
                Your photo was saved to the gallery. Check Content Editor at{' '}
                <span className="font-mono">
                  /sitecore/content/sitecoresilver/sitecoresilver/Home/SilverAttendees
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 brand-card p-6 text-sm">
            <div>
              <p className="text-silver-400">Background</p>
              <p className="font-bold">{selectedBackground.name}</p>
            </div>
            <div>
              <p className="text-silver-400">Transformation</p>
              <p className="font-bold">{selectedPrompt.title}</p>
            </div>
            <div>
              <p className="text-silver-400">Created By</p>
              <p className="font-bold">{session.userName}</p>
            </div>
            <div>
              <p className="text-silver-400">Code</p>
              <p className="font-bold">{photoCode}</p>
            </div>
          </div>

          <Link href="/summary" className="btn-sitecore-red w-full text-center block py-4 text-lg">
            ✨ View Your Silver Keepsake (25-year timeline)
          </Link>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handlePrint}
              disabled={regenerating}
              className="btn-silver-outline disabled:opacity-50"
            >
              🖨️ Print
            </button>
            <button
              type="button"
              onClick={() => router.push('/gallery')}
              className="btn-silver-outline"
            >
              🖼️ Gallery
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="btn-silver col-span-2 md:col-span-1"
            >
              📸 New Photo
            </button>
          </div>
        </div>
      </div>
    </BoothLayout>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePhotoBoothStore } from '@/store/photo-booth';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  apiFetch,
  isApiSessionError,
  refreshApiSession,
} from '@/lib/core/api-client';

export default function ProcessingPage() {
  const router = useRouter();
  const session = usePhotoBoothStore((state) => state.session);
  const capturedPhoto = usePhotoBoothStore((state) => state.capturedPhoto);
  const selectedBackground = usePhotoBoothStore((state) => state.selectedBackground);
  const selectedPrompt = usePhotoBoothStore((state) => state.selectedPrompt);
  const setCompositedPhoto = usePhotoBoothStore((state) => state.setCompositedPhoto);
  const consentTermsAccepted = usePhotoBoothStore((state) => state.consentTermsAccepted);
  const consentGalleryShare = usePhotoBoothStore((state) => state.consentGalleryShare);
  const attendeeProfile = usePhotoBoothStore((state) => state.attendeeProfile);
  const setSitecoreAttendeePage = usePhotoBoothStore((state) => state.setSitecoreAttendeePage);

  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const processingStarted = useRef(false);

  // Redirect if missing required data
  useEffect(() => {
    if (!session || !capturedPhoto || !selectedBackground || !selectedPrompt) {
      router.push('/input');
    }
  }, [session, capturedPhoto, selectedBackground, selectedPrompt, router]);

  const runProcessing = useCallback(async () => {
      try {
        setError(null);
        console.log('🚀 PROCESSING START');
        console.log('📸 Photo:', capturedPhoto ? 'YES' : 'NO');
        console.log('🎭 Background:', selectedBackground?.name || 'NONE');
        console.log('✨ Prompt:', selectedPrompt?.title || 'NONE');
        console.log('👤 Session:', session?.sessionId || 'NONE');

        if (!capturedPhoto || !selectedBackground || !selectedPrompt) {
          throw new Error('Missing required data for processing');
        }

        // Fresh session before mutating APIs (avoids stale CDN-cached tokens on Vercel)
        await refreshApiSession();

        // Step 1: Enhance image
        console.log('🎨 Step 1: Calling /api/composit-image...');
        const enhanceResponse = await apiFetch('/api/composit-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photo: capturedPhoto,
            backgroundDescription: selectedBackground.description,
            prompt:
              selectedPrompt.fullPrompt ||
              (selectedPrompt as { text?: string }).text ||
              selectedPrompt.description ||
              selectedPrompt.title,
          }),
        });

        console.log('📡 Response status:', enhanceResponse.status);
        const enhanceText = await enhanceResponse.text();
        console.log('📄 Raw response:', enhanceText.substring(0, 200));

        if (!enhanceResponse.ok) {
          throw new Error(`Enhance API failed: ${enhanceResponse.status} - ${enhanceText}`);
        }

        const enhanceResult = JSON.parse(enhanceText);
        console.log('✅ Enhance result:', enhanceResult.success ? 'SUCCESS' : 'FAILED');

        if (!enhanceResult.success) {
          throw new Error(enhanceResult.error || 'Enhancement failed');
        }

        const compositedPhoto = enhanceResult.data?.compositedPhoto;
        if (!compositedPhoto) {
          throw new Error('No composited photo in response');
        }

        console.log('✅ Image enhanced successfully');
        setCompositedPhoto(compositedPhoto);

        // Step 2: Upload to Firebase
        console.log('📤 Step 2: Calling /api/upload-photo...');
        const uploadFormData = new FormData();
        uploadFormData.append('sessionId', session!.sessionId);
        uploadFormData.append('userName', session!.userName);
        uploadFormData.append('userEmail', session!.userEmail || '');
        uploadFormData.append('originalPhoto', capturedPhoto);
        uploadFormData.append('compositedPhoto', compositedPhoto);
        uploadFormData.append('backgroundId', selectedBackground.id);
        uploadFormData.append('promptId', selectedPrompt.id);
        uploadFormData.append('consentTermsAccepted', String(consentTermsAccepted));
        uploadFormData.append('consentGalleryShare', String(consentGalleryShare));
        uploadFormData.append('syncToSitecore', 'true');
        uploadFormData.append(
          'fullName',
          attendeeProfile?.fullName ?? session!.userName
        );

        if (attendeeProfile) {
          if (attendeeProfile.company) {
            uploadFormData.append('company', attendeeProfile.company);
          }
          if (attendeeProfile.companyDescription) {
            uploadFormData.append('companyDescription', attendeeProfile.companyDescription);
          }
          if (attendeeProfile.role) {
            uploadFormData.append('role', attendeeProfile.role);
          }
          if (attendeeProfile.linkedInUrl) {
            uploadFormData.append('linkedInUrl', attendeeProfile.linkedInUrl);
          }
          if (attendeeProfile.headline) {
            uploadFormData.append('headline', attendeeProfile.headline);
          }
        }

        const uploadResponse = await apiFetch('/api/upload-photo', {
          method: 'POST',
          body: uploadFormData,
        });

        console.log('📡 Upload response status:', uploadResponse.status);
        const uploadText = await uploadResponse.text();
        console.log('📄 Upload raw response:', uploadText.substring(0, 200));

        if (!uploadResponse.ok) {
          console.warn('⚠️ Upload failed but continuing:', uploadResponse.status);
        } else {
          const uploadResult = JSON.parse(uploadText);
          console.log('✅ Upload result:', uploadResult.success ? 'SUCCESS' : uploadResult.error);
          if (uploadResult.success && uploadResult.data?.photoCode) {
            setCompositedPhoto(
              compositedPhoto,
              uploadResult.data.photoId,
              uploadResult.data.photoCode
            );
            if (uploadResult.data.sitecoreAttendeePage) {
              setSitecoreAttendeePage(uploadResult.data.sitecoreAttendeePage);
            }
          }
        }

        // Step 3: Redirect to result
        console.log('📍 Redirecting to /result...');
        setTimeout(() => {
          router.push('/result');
        }, 1000);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ PROCESSING FAILED:', errorMsg);
        console.error('Full error:', err);
        setError(errorMsg);

        if (!isApiSessionError(errorMsg)) {
          setTimeout(() => {
            router.push('/prompts');
          }, 3000);
        }
      } finally {
        setRetrying(false);
      }
  }, [
    capturedPhoto,
    selectedBackground,
    selectedPrompt,
    router,
    setCompositedPhoto,
    session,
    consentTermsAccepted,
    consentGalleryShare,
    attendeeProfile,
    setSitecoreAttendeePage,
  ]);

  const handleRetry = async () => {
    setRetrying(true);
    processingStarted.current = true;
    await runProcessing();
  };

  useEffect(() => {
    if (capturedPhoto && selectedBackground && selectedPrompt) {
      if (processingStarted.current) {
        return;
      }
      processingStarted.current = true;
      console.log('📊 Dependencies ready, starting processImage()');
      void runProcessing();
    }
  }, [capturedPhoto, selectedBackground, selectedPrompt, runProcessing]);

  if (!session || !capturedPhoto || !selectedBackground || !selectedPrompt)
    return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 border-b border-silver-400 border-opacity-20">
        <div className="text-2xl font-bold silver-accent">Sitecore Silver</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-8 w-full max-w-2xl">
          {error ? (
            // Error State
            <div className="space-y-6">
              <div className="text-6xl">⚠️</div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-red-400">
                  Processing Error
                </h2>
                <p className="text-silver-300 text-lg mb-4">{error}</p>
                {isApiSessionError(error) && (
                  <p className="text-silver-400 text-sm max-w-md mx-auto mb-4">
                    This is the booth API security session (<code className="text-silver-300">API_SECRET</code>
                    ), not your Gemini or Sitecore keys. Use Retry to fetch a fresh session.
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button
                    type="button"
                    onClick={() => void handleRetry()}
                    disabled={retrying}
                    className="px-6 py-3 rounded-lg bg-silver-400 text-sc-bg font-semibold hover:bg-silver-300 disabled:opacity-50 min-w-[10rem]"
                  >
                    {retrying ? 'Retrying…' : 'Retry processing'}
                  </button>
                  <Link
                    href="/prompts"
                    className="px-6 py-3 rounded-lg border border-silver-400 text-silver-300 hover:bg-silver-800 min-w-[10rem]"
                  >
                    Back to prompts
                  </Link>
                </div>
                {!isApiSessionError(error) && (
                  <p className="text-silver-500 text-sm mt-4">
                    Returning to prompt selection…
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Processing State
            <>
              {/* Loading Animation */}
              <div className="flex justify-center">
                <div className="animate-spin">
                  <div className="w-20 h-20 border-4 border-silver-400 border-t-transparent rounded-full" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 silver-accent">
                  Creating Your Photo...
                </h2>
                <p className="text-silver-300 text-lg">
                  Our AI is working its magic ✨
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <p className="text-silver-400">Background: {selectedBackground?.name}</p>
                <p className="text-silver-400">Transformation: {selectedPrompt?.title}</p>
              </div>

              {/* Progress */}
              <div className="max-w-sm mx-auto">
                <div className="bg-silver-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-silver-400 h-full w-2/3 animate-pulse" />
                </div>
                <p className="text-sm text-silver-400 mt-2">AI...</p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-silver-400 border-opacity-20 text-center text-sm text-silver-400">
        <p>© 2026 Sitecore | 25 Years of Innovation</p>
      </footer>
    </div>
  );
}

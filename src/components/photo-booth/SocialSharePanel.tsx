'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/core/api-client';

interface SocialSharePanelProps {
  /** Base64 data URL or blob URL from the booth session. */
  compositedPhoto?: string;
  /** Public image URL (admin gallery — Firebase Storage). */
  imageUrl?: string;
  userName: string;
  photoCode?: string;
  promptTitle?: string;
  backgroundName?: string;
  company?: string;
  role?: string;
  /** OAuth return path after LinkedIn connect (default `/result`). */
  returnPath?: string;
  compact?: boolean;
}

function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function SocialSharePanel({
  compositedPhoto,
  imageUrl,
  userName,
  photoCode,
  promptTitle,
  backgroundName,
  company,
  role,
  returnPath = '/result',
  compact = false,
}: SocialSharePanelProps) {
  const searchParams = useSearchParams();
  const [linkedInConfigured, setLinkedInConfigured] = useState(false);
  const [connected, setConnected] = useState(false);
  const [caption, setCaption] = useState('');
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [posting, setPosting] = useState(false);
  const [nativeSharing, setNativeSharing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasImage = Boolean(compositedPhoto?.trim() || imageUrl?.trim());

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/linkedin/status', { cache: 'no-store' });
    const json = (await res.json()) as {
      data?: { configured?: boolean; connected?: boolean };
    };
    setLinkedInConfigured(Boolean(json.data?.configured));
    setConnected(Boolean(json.data?.connected));
  }, []);

  const loadCaption = useCallback(async () => {
    setLoadingCaption(true);
    setError(null);
    try {
      const res = await apiFetch('/api/linkedin/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          photoCode,
          promptTitle,
          backgroundName,
          company,
          role,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { caption?: string };
        error?: string;
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate caption');
      }
      setCaption(json.data?.caption ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Caption failed');
    } finally {
      setLoadingCaption(false);
    }
  }, [userName, photoCode, promptTitle, backgroundName, company, role]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const linkedinParam = searchParams.get('linkedin');
    if (linkedinParam === 'connected') {
      setMessage('LinkedIn connected — you can post this photo.');
      void loadStatus();
    } else if (linkedinParam === 'error') {
      setError('LinkedIn connection failed. Try again.');
    }
  }, [searchParams, loadStatus]);

  useEffect(() => {
    if (linkedInConfigured && connected && !caption && !loadingCaption) {
      void loadCaption();
    }
  }, [linkedInConfigured, connected, caption, loadingCaption, loadCaption]);

  const handleConnect = () => {
    window.location.href = `/api/linkedin/auth?returnTo=${encodeURIComponent(returnPath)}`;
  };

  const handleDisconnect = async () => {
    await fetch('/api/linkedin/disconnect', { method: 'POST' });
    setConnected(false);
    setCaption('');
    setMessage('LinkedIn disconnected.');
  };

  const resolveShareFile = async (): Promise<File | null> => {
    try {
      const src = compositedPhoto?.trim() || imageUrl?.trim();
      if (!src) return null;
      const res = await fetch(src);
      if (!res.ok) return null;
      const blob = await res.blob();
      const type = blob.type || 'image/jpeg';
      const code = photoCode ?? 'photo';
      return new File([blob], `sitecore-silver-${code}.jpg`, { type });
    } catch {
      return null;
    }
  };

  const handleNativeShare = async () => {
    if (!canNativeShare()) {
      setError('Sharing is not supported in this browser. Use LinkedIn or download the image.');
      return;
    }
    setNativeSharing(true);
    setError(null);
    setMessage(null);
    try {
      const file = await resolveShareFile();
      const shareData: ShareData = {
        text:
          caption.trim() ||
          `My Sitecore Silver celebration photo — ${photoCode ?? userName}`,
      };
      if (file) {
        shareData.files = [file];
      }
      await navigator.share(shareData);
      setMessage('Shared!');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Share failed');
    } finally {
      setNativeSharing(false);
    }
  };

  const handlePost = async () => {
    setPosting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch('/api/linkedin/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: compositedPhoto,
          imageUrl: imageUrl,
          userName,
          photoCode,
          promptTitle,
          backgroundName,
          company,
          role,
          caption: caption.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { message?: string };
        error?: string;
        code?: string;
      };

      if (json.code === 'NOT_CONNECTED') {
        setConnected(false);
        throw new Error(json.error || 'Connect LinkedIn first');
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Post failed');
      }

      setMessage(json.data?.message ?? 'Posted to LinkedIn!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Post failed');
    } finally {
      setPosting(false);
    }
  };

  if (!hasImage) return null;

  return (
    <div
      className={`brand-card space-y-4 text-sm border border-silver-500/30 ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div>
        <p className="text-silver-200 font-semibold uppercase tracking-wide flex items-center gap-2">
          📱 Share to social
        </p>
        <p className="text-silver-500 text-xs mt-1">
          Post to LinkedIn with an AI caption, or share via your device (Instagram, Messages, etc.)
        </p>
      </div>

      {canNativeShare() && (
        <button
          type="button"
          onClick={() => void handleNativeShare()}
          disabled={nativeSharing || posting}
          className="btn-silver-outline w-full py-3 disabled:opacity-50"
        >
          {nativeSharing ? 'Opening share…' : 'Share via device apps'}
        </button>
      )}

      {linkedInConfigured ? (
        <div className="space-y-3 pt-2 border-t border-silver-500/20">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[#0A66C2] font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
              <span aria-hidden>in</span> LinkedIn
            </p>
            {connected && (
              <button
                type="button"
                onClick={() => void handleDisconnect()}
                className="text-xs text-silver-500 hover:text-silver-300 shrink-0"
              >
                Disconnect
              </button>
            )}
          </div>

          {!connected ? (
            <button
              type="button"
              onClick={handleConnect}
              className="btn-silver-outline w-full py-2"
            >
              Connect LinkedIn to post
            </button>
          ) : (
            <>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={compact ? 5 : 8}
                className="w-full rounded-lg bg-black/40 border border-silver-500/40 text-silver-100 text-sm p-3 resize-y min-h-[100px]"
                placeholder="Generating caption…"
                disabled={loadingCaption || posting}
              />
              <p className="text-silver-600 text-xs">
                Includes #Sitecore #SitecoreSilver #SitecoreCommunity #DigitalExperience
                #copenhagen and @Sitecore
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => void loadCaption()}
                  disabled={loadingCaption || posting}
                  className="btn-silver-outline flex-1 py-2 disabled:opacity-50"
                >
                  {loadingCaption ? 'Generating…' : '✨ Regenerate caption'}
                </button>
                <button
                  type="button"
                  onClick={() => void handlePost()}
                  disabled={loadingCaption || posting || !caption.trim()}
                  className="btn-silver flex-1 py-2 disabled:opacity-50 bg-[#0A66C2] hover:bg-[#004182] border-[#0A66C2]"
                >
                  {posting ? 'Posting…' : 'Post to LinkedIn'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="text-silver-500 text-xs">
          LinkedIn posting: set{' '}
          <code className="text-silver-400">LINKEDIN_CLIENT_ID</code> and{' '}
          <code className="text-silver-400">LINKEDIN_CLIENT_SECRET</code> on the server to
          enable direct LinkedIn posts.
        </p>
      )}

      {message && <p className="text-green-400 text-xs">{message}</p>}
      {error && <p className="text-red-400 text-xs break-words">{error}</p>}
    </div>
  );
}

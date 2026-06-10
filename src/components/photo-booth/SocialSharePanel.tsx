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
  companyDescription?: string;
  role?: string;
  headline?: string;
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
  companyDescription,
  role,
  headline,
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
      const res = await apiFetch('/api/social/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          photoCode,
          promptTitle,
          backgroundName,
          company,
          companyDescription,
          role,
          headline,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { caption?: string };
        error?: string;
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate post text');
      }
      setCaption(json.data?.caption ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Post text generation failed');
    } finally {
      setLoadingCaption(false);
    }
  }, [
    userName,
    photoCode,
    promptTitle,
    backgroundName,
    company,
    companyDescription,
    role,
    headline,
  ]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    void loadCaption();
  }, [loadCaption]);

  useEffect(() => {
    const linkedinParam = searchParams.get('linkedin');
    if (linkedinParam === 'connected') {
      setMessage('LinkedIn connected — you can post your photo.');
      void loadStatus();
    } else if (linkedinParam === 'error') {
      setError('LinkedIn connection failed. Try again.');
    }
  }, [searchParams, loadStatus]);

  const handleConnect = () => {
    window.location.href = `/api/linkedin/auth?returnTo=${encodeURIComponent(returnPath)}`;
  };

  const handleDisconnect = async () => {
    await fetch('/api/linkedin/disconnect', { method: 'POST' });
    setConnected(false);
    setMessage('LinkedIn disconnected.');
  };

  const handleCopyText = async () => {
    if (!caption.trim()) return;
    try {
      await navigator.clipboard.writeText(caption);
      setMessage('Post text copied to clipboard.');
    } catch {
      setError('Could not copy — select the text and copy manually.');
    }
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
      setError('Sharing is not supported in this browser. Copy the text and download the image.');
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
          companyDescription,
          role,
          headline,
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
          AI-generated post text from your profile — edit, copy, or share with your photo
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-silver-400 font-semibold uppercase tracking-wide">
          AI post text
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={compact ? 6 : 9}
          className="w-full rounded-lg bg-black/40 border border-silver-500/40 text-silver-100 text-sm p-3 resize-y min-h-[140px]"
          placeholder={loadingCaption ? 'Generating post with AI…' : 'Post text'}
          disabled={loadingCaption || posting}
        />
        <p className="text-silver-600 text-xs">
          Includes #Sitecore #SitecoreSilver #SitecoreCommunity #DigitalExperience #copenhagen
          and @Sitecore
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => void loadCaption()}
            disabled={loadingCaption || posting}
            className="btn-silver-outline flex-1 py-2 disabled:opacity-50"
          >
            {loadingCaption ? 'Generating…' : '✨ Regenerate with AI'}
          </button>
          <button
            type="button"
            onClick={() => void handleCopyText()}
            disabled={loadingCaption || posting || !caption.trim()}
            className="btn-silver-outline flex-1 py-2 disabled:opacity-50"
          >
            Copy text
          </button>
        </div>
      </div>

      {canNativeShare() && (
        <button
          type="button"
          onClick={() => void handleNativeShare()}
          disabled={nativeSharing || posting || loadingCaption}
          className="btn-silver-outline w-full py-3 disabled:opacity-50"
        >
          {nativeSharing ? 'Opening share…' : 'Share photo + text via device apps'}
        </button>
      )}

      {linkedInConfigured && (
        <div className="space-y-3 pt-2 border-t border-silver-500/20">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[#0A66C2] font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
              <span aria-hidden>in</span> Post to LinkedIn
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
            <button
              type="button"
              onClick={() => void handlePost()}
              disabled={loadingCaption || posting || !caption.trim()}
              className="btn-silver w-full py-2 disabled:opacity-50 bg-[#0A66C2] hover:bg-[#004182] border-[#0A66C2]"
            >
              {posting ? 'Posting…' : 'Post to LinkedIn'}
            </button>
          )}
        </div>
      )}

      {message && <p className="text-green-400 text-xs">{message}</p>}
      {error && <p className="text-red-400 text-xs break-words">{error}</p>}
    </div>
  );
}

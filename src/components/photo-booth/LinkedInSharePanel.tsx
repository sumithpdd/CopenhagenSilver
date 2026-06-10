'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/core/api-client';

interface LinkedInSharePanelProps {
  compositedPhoto: string;
  userName: string;
  photoCode?: string;
  promptTitle?: string;
  backgroundName?: string;
  company?: string;
  role?: string;
}

export function LinkedInSharePanel({
  compositedPhoto,
  userName,
  photoCode,
  promptTitle,
  backgroundName,
  company,
  role,
}: LinkedInSharePanelProps) {
  const searchParams = useSearchParams();
  const [configured, setConfigured] = useState(false);
  const [connected, setConnected] = useState(false);
  const [caption, setCaption] = useState('');
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/linkedin/status', { cache: 'no-store' });
    const json = (await res.json()) as {
      data?: { configured?: boolean; connected?: boolean };
    };
    setConfigured(Boolean(json.data?.configured));
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
      setMessage('LinkedIn connected — you can post your photo.');
      void loadStatus();
    } else if (linkedinParam === 'error') {
      setError('LinkedIn connection failed. Try again.');
    }
  }, [searchParams, loadStatus]);

  useEffect(() => {
    if (configured && connected && !caption && !loadingCaption) {
      void loadCaption();
    }
  }, [configured, connected, caption, loadingCaption, loadCaption]);

  if (!configured) {
    return null;
  }

  const handleConnect = () => {
    window.location.href = `/api/linkedin/auth?returnTo=${encodeURIComponent('/result')}`;
  };

  const handleDisconnect = async () => {
    await fetch('/api/linkedin/disconnect', { method: 'POST' });
    setConnected(false);
    setCaption('');
    setMessage('LinkedIn disconnected.');
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

  return (
    <div className="brand-card p-6 space-y-4 text-sm border border-[#0A66C2]/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[#0A66C2] font-semibold uppercase tracking-wide flex items-center gap-2">
            <span aria-hidden>in</span> Share on LinkedIn
          </p>
          <p className="text-silver-500 text-xs mt-1">
            AI caption with #Sitecore #SitecoreSilver #SitecoreCommunity #DigitalExperience
            #copenhagen and @Sitecore
          </p>
        </div>
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
        <button type="button" onClick={handleConnect} className="btn-silver-outline w-full py-3">
          Connect LinkedIn to post
        </button>
      ) : (
        <>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={8}
            className="w-full rounded-lg bg-black/40 border border-silver-500/40 text-silver-100 text-sm p-3 resize-y min-h-[140px]"
            placeholder="Generating caption…"
            disabled={loadingCaption || posting}
          />
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

      {message && <p className="text-green-400 text-xs">{message}</p>}
      {error && <p className="text-red-400 text-xs break-words">{error}</p>}
    </div>
  );
}

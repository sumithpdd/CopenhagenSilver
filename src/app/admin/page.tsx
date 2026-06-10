'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BoothLayout } from '@/components/common/BoothLayout';
import { SocialSharePanel } from '@/components/photo-booth/SocialSharePanel';
import { FormInput } from '@/components/ui/FormInput';
import { bootstrapApiSession } from '@/lib/core/api-client';
import type { PhotoBoothPhoto, PhotoVisibility, ModerationStatus } from '@/types';

type AdminPhoto = PhotoBoothPhoto;

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'public' | 'hidden'>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (filter !== 'all') params.set('visibility', filter);

      const res = await fetch(`/api/admin/photos?${params}`);
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) setAuthenticated(false);
        throw new Error(json.error || 'Failed to load photos');
      }
      setPhotos(json.data?.photos ?? []);
      setAuthenticated(true);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, [filter]);

  useEffect(() => {
    bootstrapApiSession();
    loadPhotos();
  }, [loadPhotos]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok) {
      setLoginError(json.error || 'Login failed');
      return;
    }
    setAuthenticated(true);
    setPassword('');
    loadPhotos();
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setPhotos([]);
  };

  const patchPhoto = async (
    id: string,
    body: Partial<{
      visibility: PhotoVisibility;
      moderationStatus: ModerationStatus;
      userName: string;
      moderationNote: string;
    }>
  ) => {
    setActionError(null);
    const res = await fetch(`/api/admin/photos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setActionError(json.error || 'Update failed');
      return;
    }
    setPhotos((prev) => prev.map((p) => (p.id === id ? json.data : p)));
  };

  const deletePhoto = async (id: string) => {
    if (!confirm('Permanently delete this photo and storage files?')) return;
    setActionError(null);
    const res = await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) {
      setActionError(json.error || 'Delete failed');
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  if (checking && !authenticated) {
    return (
      <BoothLayout>
        <div className="flex items-center justify-center min-h-[50vh] text-silver-400">
          Checking access…
        </div>
      </BoothLayout>
    );
  }

  if (!authenticated && !loading && photos.length === 0) {
    return (
      <BoothLayout>
        <div className="max-w-sm mx-auto p-8 py-16">
          <h1 className="text-2xl font-bold silver-accent text-center mb-6">
            Admin · Gallery moderation
          </h1>
          <form onSubmit={handleLogin} className="brand-card p-6 space-y-4">
            <label className="block text-sm text-silver-300">
              Staff password
              <FormInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
                autoComplete="current-password"
              />
            </label>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button type="submit" className="btn-silver w-full">
              Sign in
            </button>
          </form>
          <p className="text-center text-xs text-silver-500 mt-6">
            Set <code className="text-silver-400">ADMIN_SECRET</code> in server env.{' '}
            <Link href="/" className="link-sitecore">
              Home
            </Link>
          </p>
        </div>
      </BoothLayout>
    );
  }

  return (
    <BoothLayout>
      <div className="max-w-6xl mx-auto p-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold silver-accent">
              Admin · Photo moderation
            </h1>
            <p className="text-silver-400 text-sm mt-1">
              Hide, show, edit, or delete gallery photos (GDPR / conduct)
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => loadPhotos()} className="btn-silver-outline">
              Refresh
            </button>
            <button type="button" onClick={handleLogout} className="btn-silver-outline">
              Log out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'public', 'hidden'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === f ? 'btn-silver !py-2' : 'btn-silver-outline !py-2'
              }`}
            >
              {f === 'all' ? 'All' : f === 'public' ? 'Public' : 'Hidden'}
            </button>
          ))}
        </div>

        {actionError && (
          <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded">{actionError}</p>
        )}

        {loading ? (
          <p className="text-silver-400 text-center py-12">Loading…</p>
        ) : photos.length === 0 ? (
          <p className="text-silver-400 text-center py-12">No photos</p>
        ) : (
          <div className="grid gap-4">
            {photos.map((photo) => (
              <AdminPhotoRow
                key={photo.id}
                photo={photo}
                onPatch={patchPhoto}
                onDelete={deletePhoto}
              />
            ))}
          </div>
        )}
      </div>
    </BoothLayout>
  );
}

function AdminPhotoRow({
  photo,
  onPatch,
  onDelete,
}: {
  photo: AdminPhoto;
  onPatch: (
    id: string,
    body: Partial<{
      visibility: PhotoVisibility;
      moderationStatus: ModerationStatus;
      userName: string;
      moderationNote: string;
    }>
  ) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(photo.userName);
  const [note, setNote] = useState(photo.moderationNote ?? '');
  const [showShare, setShowShare] = useState(false);

  const isHidden = photo.visibility === 'hidden';
  const galleryConsent = photo.consentGalleryShare !== false;

  return (
    <div className="brand-card p-4 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
      <div className="shrink-0 w-full md:w-40 h-32 rounded overflow-hidden bg-black">
        <img
          src={photo.compositedPhotoUrl}
          alt={photo.photoCode}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-2 text-sm">
        <p className="font-mono text-silver-400">{photo.photoCode}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className={`px-2 py-0.5 rounded ${
              isHidden ? 'bg-amber-900/40 text-amber-200' : 'bg-green-900/40 text-green-200'
            }`}
          >
            {isHidden ? 'Hidden' : 'Visible'}
          </span>
          <span className="px-2 py-0.5 rounded bg-silver-800 text-silver-300">
            Gallery consent: {galleryConsent ? 'yes' : 'no'}
          </span>
          <span className="px-2 py-0.5 rounded bg-silver-800 text-silver-300">
            {photo.moderationStatus ?? 'approved'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <FormInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="!py-2 !text-sm flex-1 min-w-[120px]"
          />
          <button
            type="button"
            className="btn-silver-outline !py-1 !px-3 text-xs"
            onClick={() => onPatch(photo.id, { userName: name })}
          >
            Save name
          </button>
        </div>

        <FormInput
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Moderation note"
          className="!py-2 !text-sm"
        />
        <button
          type="button"
          className="text-xs text-silver-400 underline"
          onClick={() => onPatch(photo.id, { moderationNote: note })}
        >
          Save note
        </button>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <button
          type="button"
          className="btn-silver-outline !py-2 text-sm"
          onClick={() =>
            onPatch(photo.id, {
              visibility: isHidden ? 'public' : 'hidden',
            })
          }
        >
          {isHidden ? 'Show in gallery' : 'Hide from gallery'}
        </button>
        <button
          type="button"
          className="btn-silver-outline !py-2 text-sm"
          onClick={() =>
            onPatch(photo.id, {
              moderationStatus:
                photo.moderationStatus === 'rejected' ? 'approved' : 'rejected',
              visibility: 'hidden',
            })
          }
        >
          {photo.moderationStatus === 'rejected' ? 'Approve' : 'Reject & hide'}
        </button>
        <button
          type="button"
          className="btn-silver-outline !py-2 text-sm"
          onClick={() => setShowShare((v) => !v)}
        >
          {showShare ? 'Close share' : '📱 Share to social'}
        </button>
        <button
          type="button"
          className="!py-2 text-sm px-4 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-900/20"
          onClick={() => onDelete(photo.id)}
        >
          Delete permanently
        </button>
      </div>
      </div>

      {showShare && (
        <Suspense fallback={null}>
          <SocialSharePanel
            imageUrl={photo.compositedPhotoUrl}
            userName={photo.userName}
            photoCode={photo.photoCode}
            company={photo.attendeeProfile?.company}
            companyDescription={photo.attendeeProfile?.companyDescription}
            role={photo.attendeeProfile?.role}
            headline={photo.attendeeProfile?.headline}
            returnPath="/admin"
            compact
          />
        </Suspense>
      )}
    </div>
  );
}

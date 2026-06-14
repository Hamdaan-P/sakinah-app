/**
 * Public Profile Page — shown at /p/:slug.
 * Rendered to anyone (no auth required). Only displays data we explicitly
 * mirrored to public_profiles/{uid}; never reads the private users/{uid} doc.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy } from '@phosphor-icons/react';
import { PremiumIslamicBackground } from '@/components/shared/PremiumIslamicBackground';
import { useAuthStore } from '@/core/stores/auth.store';
import { getPublicProfileBySlug } from '../services/publicProfileService';
import type { PublicProfile } from '../types/public-profile.types';
import { useConnectionStatus } from '@/features/connections/hooks/useConnectionStatus';
import logoGold from '@/assets/zaryah-logo-gold.png';
import { LoadingShell, NotFoundShell, PrivateShell } from './components/_primitives';
import { ProfileBody } from './components/ProfileBody';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'private' }
  | { kind: 'ok'; profile: PublicProfile };

export default function PublicProfilePage() {
  // Two route shapes land here:
  //   /p/:slug          → params.slug = "umar"
  //   /:atHandle        → params.atHandle = "@umar" (we strip the @)
  const params = useParams();
  const rawSlug = params.slug;
  const atHandle = (params as Record<string, string | undefined>).atHandle;
  const slug = rawSlug ?? (atHandle?.startsWith('@') ? atHandle.slice(1) : '');
  const isHandleRoute = !rawSlug;
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const [load, setLoad] = useState<LoadState>({ kind: 'loading' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // On the catch-all route, require an @ prefix. Anything without it is
    // not a handle (e.g. a typoed path) and should 404 immediately.
    if (isHandleRoute && !atHandle?.startsWith('@')) {
      setLoad({ kind: 'not-found' });
      return;
    }
    if (!slug) {
      setLoad({ kind: 'not-found' });
      return;
    }
    (async () => {
      setLoad({ kind: 'loading' });
      const profile = await getPublicProfileBySlug(slug);
      if (cancelled) return;
      if (!profile) return setLoad({ kind: 'not-found' });
      if (!profile.isPublic) return setLoad({ kind: 'private' });
      setLoad({ kind: 'ok', profile });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, isHandleRoute, atHandle]);

  const publicUrl = useMemo(
    () => (typeof window !== 'undefined' ? `${window.location.origin}/@${slug}` : `/@${slug}`),
    [slug],
  );

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* best-effort */ }
  }

  const loadedProfileUid = load.kind === 'ok' ? load.profile.uid : undefined;
  const connection = useConnectionStatus(currentUser?.id, loadedProfileUid);

  function redirectToLoginFor(action: string) {
    navigate(`/login?redirect=${encodeURIComponent(`/@${slug}?action=${action}`)}`);
  }

  return (
    <div className="min-h-screen bg-[#0F1724] text-[#F5E8C7] relative overflow-hidden">
      <PremiumIslamicBackground variant="hero" />

      {/* Top bar */}
      <header className="relative z-20 sticky top-0 backdrop-blur-md bg-[#0F1724]/80 border-b border-[rgba(212,168,83,0.12)]">
        <div className="max-w-[640px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            to={isAuthenticated ? '/' : '/welcome'}
            className="p-2 rounded-full bg-[#0F141F]/60 hover:bg-[#0F141F]/80 border border-[rgba(212,168,83,0.2)] transition-colors flex-shrink-0"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
          <Link
            to="/welcome"
            className="flex items-center gap-2 min-w-0 flex-shrink"
            aria-label="ZaryahPlus home"
          >
            {/* Inline style on height/width — beats the unlayered `img { height: auto }`
                rule in index.css that otherwise lets this 700×700 PNG render at natural size. */}
            <img
              src={logoGold}
              alt=""
              width={24}
              height={24}
              style={{ height: 24, width: 'auto' }}
              className="select-none flex-shrink-0"
            />
            <span
              className="text-sm font-bold text-[#F5E8C7] truncate"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Zaryah<sup className="text-[#D4A853] text-[10px]">+</sup>
            </span>
          </Link>
          <button
            onClick={copyUrl}
            className="px-3 py-2 rounded-full bg-[#0F141F]/60 hover:bg-[#0F141F]/80 border border-[rgba(212,168,83,0.2)] text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="relative z-10 max-w-[640px] mx-auto px-4 pb-16">
        {load.kind === 'loading' && <LoadingShell />}
        {load.kind === 'not-found' && <NotFoundShell slug={slug} />}
        {load.kind === 'private' && <PrivateShell />}
        {load.kind === 'ok' && (
          <ProfileBody
            profile={load.profile}
            isOwner={currentUser?.id === load.profile.uid}
            isAuthenticated={isAuthenticated}
            connection={connection}
            onUnauthed={() => redirectToLoginFor('connect')}
          />
        )}
      </div>
    </div>
  );
}

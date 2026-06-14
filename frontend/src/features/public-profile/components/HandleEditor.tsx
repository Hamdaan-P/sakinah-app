/**
 * Handle (slug) editor card extracted from PublicProfileSettings.
 * Renders the read-only view, edit form, slug-availability check, and copy button.
 */

import { useEffect, useState } from 'react';
import { Check, Copy, PencilSimple } from '@phosphor-icons/react';
import {
  claimSlug,
  isSlugAvailable,
  isSlugFormatValid,
} from '../services/publicProfileService';
import type { PublicProfile } from '../types/public-profile.types';

export type SlugCheck = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'unchanged';

interface HandleEditorProps {
  userId: string;
  profile: PublicProfile;
  onSlugChange: (slug: string) => void;
}

export function HandleEditor({ userId, profile, onSlugChange }: HandleEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draftSlug, setDraftSlug] = useState(profile.slug);
  const [check, setCheck] = useState<SlugCheck>('idle');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Debounced availability check as the user types
  useEffect(() => {
    if (!editing) return;
    setErrorMsg(null);
    if (draftSlug === profile.slug) {
      setCheck('unchanged');
      return;
    }
    if (!isSlugFormatValid(draftSlug)) {
      setCheck('invalid');
      return;
    }
    setCheck('checking');
    const timer = setTimeout(async () => {
      try {
        const free = await isSlugAvailable(draftSlug);
        setCheck(free ? 'available' : 'taken');
      } catch {
        setCheck('invalid');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [draftSlug, editing, profile.slug]);

  async function handleSaveSlug() {
    if (draftSlug === profile.slug) {
      setEditing(false);
      return;
    }
    if (!isSlugFormatValid(draftSlug)) {
      setErrorMsg('Handle must be 3–24 chars, lowercase letters/numbers/dashes.');
      return;
    }
    try {
      setSaving(true);
      setErrorMsg(null);
      await claimSlug(userId, draftSlug, profile.slug || null);
      onSlugChange(draftSlug);
      setEditing(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save handle.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    if (!profile.slug) return;
    const url = `${window.location.origin}/@${profile.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* best-effort */ }
  }

  return (
    <div className="rounded-xl bg-[#0F1724]/80 border border-[rgba(212,168,83,0.1)] p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wider text-[#D4A853]/70 font-semibold">Your handle</p>
        {!editing && (
          <button
            onClick={() => {
              setEditing(true);
              setDraftSlug(profile.slug);
            }}
            className="text-[11px] text-[#D4A853] hover:text-[#E8C97A] flex items-center gap-1"
          >
            <PencilSimple size={11} weight="bold" />
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 text-[#F5E8C7] text-sm font-mono truncate">
            zaryahplus.com/@<span className="text-[#D4A853]">{profile.slug}</span>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-[#0F141F] hover:bg-[#10151F] transition-colors text-[#D4A853]"
            aria-label="Copy link"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 bg-[#0F141F]/70 rounded-lg px-3 py-2 border border-[rgba(212,168,83,0.15)]">
            <span className="text-[#5C5749] text-xs">zaryahplus.com/@</span>
            <input
              value={draftSlug}
              onChange={(e) => setDraftSlug(e.target.value.toLowerCase())}
              maxLength={24}
              // eslint-disable-next-line jsx-a11y/no-autofocus -- user-action-triggered slug editor; auto-focus is expected UX
              autoFocus
              className="flex-1 bg-transparent text-[#F5E8C7] text-sm font-mono outline-none"
              placeholder="your-handle"
            />
            <SlugStatus check={check} />
          </div>
          {errorMsg && <p className="text-[11px] text-red-400 mt-2">{errorMsg}</p>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setEditing(false);
                setDraftSlug(profile.slug);
                setErrorMsg(null);
              }}
              className="flex-1 py-2 rounded-lg text-[12px] font-medium bg-[#0F141F] text-[#7A7363] hover:text-[#F5E8C7] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSlug}
              disabled={saving || check === 'taken' || check === 'invalid' || check === 'checking'}
              className="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
                color: '#0A0E16',
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SlugStatus({ check }: { check: SlugCheck }) {
  if (check === 'idle' || check === 'unchanged') return null;
  if (check === 'checking') {
    return <span className="text-[10px] text-[#7A7363]">…</span>;
  }
  if (check === 'available') {
    return <span className="text-[10px] text-[#2A9D6F] font-semibold">Available</span>;
  }
  if (check === 'taken') {
    return <span className="text-[10px] text-red-400 font-semibold">Taken</span>;
  }
  if (check === 'invalid') {
    return <span className="text-[10px] text-[#D4A853] font-semibold">Invalid</span>;
  }
  return null;
}

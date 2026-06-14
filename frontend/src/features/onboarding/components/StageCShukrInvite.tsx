/**
 * Stage C — Raya invites the first Shukr.
 *
 * Free-form textarea, soft-validated (must have at least 2 chars after trim).
 * Submit advances state via the store (which also writes to Firestore best-
 * effort) and the next stage renders without a route change.
 */

import { useState } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import { RayaOrb } from './RayaOrb';
import { useOnboardingStore } from '../stores/onboarding.store';

export function StageCShukrInvite() {
  const submitShukr = useOnboardingStore((s) => s.submitShukr);
  const uid = useAuthStore((s) => s.user?.id ?? null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = text.trim().length >= 2 && !busy;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    await submitShukr(text, uid);
  };

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-start px-6 pt-[12vh] pb-12 text-center">
      <div
        className="mb-7 inline-flex items-center gap-3 rounded-3xl border border-[rgba(212,168,83,0.22)] px-4 py-2.5"
        style={{ background: 'rgba(212,168,83,0.05)' }}
      >
        <RayaOrb variant="mini" />
        <span
          className="text-[12px] italic text-[#E8C97A]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Before we go anywhere else, just one thing.
        </span>
      </div>

      <h2
        className="mb-3 text-[clamp(1.5rem,3vw+1rem,2rem)] leading-[1.25] text-[#F5E8C7]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        Tell me <em className="text-[#E8C97A] not-italic font-medium">one thing</em> you noticed today.
      </h2>

      <p
        className="mb-7 max-w-[380px] text-[13px] italic leading-[1.55] text-[#7A7363]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Anything. A sunbeam. A breath. A face you missed. Three words is plenty.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Today, I noticed…"
        rows={3}
        maxLength={500}
        className="mb-5 w-full max-w-[420px] resize-none rounded-2xl border border-[rgba(212,168,83,0.22)] bg-[rgba(245,232,199,0.03)] px-4 py-3.5 text-[15px] leading-[1.55] text-[#F5E8C7] placeholder-[#5C5749] outline-none transition-colors focus:border-[rgba(212,168,83,0.55)]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
      />

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mb-8 w-full max-w-[320px] rounded-2xl py-4 text-[15px] font-semibold text-[#0A0E16] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
        style={{
          background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.02em',
          boxShadow: '0 8px 28px rgba(212,168,83,0.22)',
        }}
      >
        {busy ? 'Carrying it…' : 'Tell Raya'}
      </button>

      <p
        className="text-[11px] italic tracking-[0.04em] text-[#5C5749]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        No accounts. No streaks. No counting. Yet.
      </p>
    </div>
  );
}

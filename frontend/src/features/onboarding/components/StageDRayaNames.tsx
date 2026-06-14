/**
 * Stage D — Raya names what just happened: Shukr.
 *
 * Echoes the user's submission back (preserved by the store from Stage C),
 * then frames it theologically without claiming divine acceptance — the
 * difference between "you did Shukr" (described) and "Allah accepted your
 * Shukr" (forbidden by spec).
 */

import { useAuthStore } from '@/core/stores/auth.store';
import { RayaOrb } from './RayaOrb';
import { useOnboardingStore } from '../stores/onboarding.store';

export function StageDRayaNames() {
  const text = useOnboardingStore((s) => s.firstShukrText);
  const finish = useOnboardingStore((s) => s.finish);
  const uid = useAuthStore((s) => s.user?.id ?? null);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-start px-6 pt-[10vh] pb-12 text-center">
      {text && (
        <div
          className="mb-8 w-full max-w-[420px] rounded-2xl border border-[rgba(245,232,199,0.10)] px-5 py-4"
          style={{ background: 'rgba(245,232,199,0.025)' }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.22em] text-[#5C5749] mb-1.5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            You said
          </p>
          <p
            className="text-[15px] italic leading-[1.5] text-[#F5E8C7]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            &ldquo;{text}&rdquo;
          </p>
        </div>
      )}

      <RayaOrb variant="mini" className="mb-5" />

      <h2
        className="mb-3 text-[clamp(1.5rem,3vw+1rem,2rem)] leading-[1.25] text-[#F5E8C7]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        Beautiful.
      </h2>

      <p
        className="mb-8 max-w-[380px] text-[16px] italic leading-[1.55] text-[#C9C0A8]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        What you just did has a name — <em className="text-[#E8C97A] not-italic font-medium">Shukr</em>.
      </p>

      <ul className="mb-10 w-full max-w-[380px] space-y-2.5 text-left">
        {[
          'Your heart, when it notices something good.',
          'The bond between you and the One who gave it.',
          'The barakah that follows — quietly, often unseen.',
        ].map((line) => (
          <li
            key={line}
            className="flex items-start gap-3 text-[13.5px] leading-[1.5] text-[#C9C0A8]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            <span className="mt-[7px] block h-[5px] w-[5px] shrink-0 rounded-full bg-[#D4A853]" />
            <span><em className="text-[#7A7363] not-italic">What grows:</em> {line}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => finish(uid)}
        className="w-full max-w-[320px] rounded-2xl py-4 text-[15px] font-semibold text-[#0A0E16] transition-transform active:scale-[0.98]"
        style={{
          background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.02em',
          boxShadow: '0 8px 28px rgba(212,168,83,0.22)',
        }}
      >
        Show me around
      </button>
    </div>
  );
}

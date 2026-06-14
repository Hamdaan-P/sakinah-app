/**
 * Stage B — Raya welcomes the user.
 *
 * Static copy by design (per spec): the first impression of Raya must read
 * the same for everyone. No LLM call here. The orb is light, not a face.
 */

import { useNavigate } from 'react-router-dom';
import { RayaOrb } from './RayaOrb';
import { useOnboardingStore } from '../stores/onboarding.store';

export function StageBRayaWelcome() {
  const navigate = useNavigate();
  const setStage = useOnboardingStore((s) => s.setStage);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center px-6 py-12 text-center">
      <RayaOrb variant="hero" className="mb-10" />

      <p
        className="mb-3 text-[20px] text-[#E8C97A]"
        style={{ fontFamily: "'Amiri', serif" }}
      >
        السلام عليكم
      </p>

      <h1
        className="mb-6 text-[clamp(1.75rem,4vw+1rem,2.25rem)] leading-[1.2] text-[#F5E8C7]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        I'm Raya.
      </h1>

      <p
        className="mb-10 max-w-[380px] text-[16px] italic leading-[1.6] text-[#C9C0A8]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Most people who walk in here are carrying <em className="text-[#E8C97A] not-italic font-medium">something</em> — a worry, a wish, a quiet thank-you waiting to be said.
      </p>

      <button
        onClick={() => setStage('c')}
        className="mb-4 w-full max-w-[320px] rounded-2xl py-4 text-[15px] font-semibold text-[#0A0E16] transition-transform active:scale-[0.98]"
        style={{
          background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.02em',
          boxShadow: '0 8px 28px rgba(212,168,83,0.22)',
        }}
      >
        Yes, let's start there
      </button>

      <button
        onClick={() => navigate('/about')}
        className="text-[13px] text-[#7A7363] underline-offset-4 hover:text-[#C9C0A8] hover:underline"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Tell me more about Raya first
      </button>
    </div>
  );
}

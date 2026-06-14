/**
 * Stage A — marketing hero shown at /welcome.
 *
 * Per the AEBCD spec: no Sign In / Sign Up CTAs. Both CTAs route to '/'.
 * Tapping either flips the onboarding stage to 'b' so DashboardPage's
 * OnboardingTakeover opens Stage B once the user lands at the home route.
 *
 * Unauthenticated taps: AuthGuard intercepts at '/' and redirects to /login,
 * the user signs up/in, and is then carried into Stage B on return.
 */

import { useNavigate } from 'react-router-dom';
import { Starfield } from '../components/Starfield';
import { useOnboardingStore } from '../stores/onboarding.store';

export default function StageALanding() {
  const navigate = useNavigate();
  const setStage = useOnboardingStore((s) => s.setStage);

  const begin = () => {
    setStage('b');
    navigate('/');
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-[#F5E8C7]">
      <Starfield />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center px-6 py-12 text-center">
        <span
          className="mb-6 inline-block rounded-full border border-[rgba(212,168,83,0.30)] px-3.5 py-1 text-[10px] uppercase tracking-[0.28em] text-[#D4A853]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          The World's First Islamic Super Agent
        </span>

        <h1
          className="mb-4 text-[clamp(2rem,5vw+1rem,3rem)] leading-[1.1] text-[#F5E8C7]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Live with Purpose,
          <br />
          Powered by Intelligence
        </h1>

        <p
          className="mb-10 max-w-[360px] text-[14px] italic leading-[1.55] text-[#7A7363]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Of the Muslims. By the Muslims. For the Muslims.
        </p>

        <button
          onClick={begin}
          className="mb-3 w-full max-w-[320px] rounded-2xl py-4 text-[15px] font-semibold text-[#0A0E16] transition-transform active:scale-[0.98]"
          style={{
            background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.02em',
            boxShadow: '0 8px 28px rgba(212,168,83,0.22)',
          }}
        >
          Begin
        </button>

        <button
          onClick={begin}
          className="w-full max-w-[320px] rounded-2xl border border-[rgba(212,168,83,0.30)] py-4 text-[14px] text-[#F5E8C7] transition-colors hover:border-[rgba(212,168,83,0.55)] hover:bg-[rgba(212,168,83,0.04)]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Step Inside
        </button>

        <p
          className="mt-12 text-[11px] tracking-[0.18em] text-[#5C5749]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          NO ACCOUNTS · NO STREAKS · NO COUNTING · YET
        </p>
      </div>
    </div>
  );
}

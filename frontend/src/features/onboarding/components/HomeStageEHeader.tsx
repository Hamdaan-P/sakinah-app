/**
 * Stage E — Home reveal header. Always rendered at the top of the home
 * route; replaces the legacy `MobileHomeReveal` (mobile-only) with a
 * responsive shell that works the same on phone and desktop.
 *
 * Composition:
 *   - Greeting row (As-salamu alaykum + first-name + profile circle).
 *   - Raya pill — the highest-affinity interactive element on the page.
 *   - One-line intro: "Five doors. Open any one."
 *   - 6-tile grid (Baraka featured) — Baraka spans 2 columns and, after the
 *     user has submitted their first Shukr in Stage C, takes the gold-bordered
 *     "keep going" treatment.
 *
 * The bottom dock is owned by `BottomNavBar` (shared across every mobile route).
 * Tile routes match what's already registered in router.tsx.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/stores/auth.store';
import { useOnboardingStore } from '../stores/onboarding.store';

function firstName(displayName?: string | null, email?: string | null): string {
  if (displayName?.trim()) return displayName.trim().split(/\s+/)[0];
  if (email) return email.split('@')[0];
  return 'friend';
}

export function HomeStageEHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const firstShukrAt = useOnboardingStore((s) => s.firstShukrSubmittedAt);

  const initial = useMemo(() => {
    const n = firstName(user?.displayName, user?.email);
    return n.charAt(0).toUpperCase() || '~';
  }, [user?.displayName, user?.email]);

  const barakaFeatured = firstShukrAt != null;

  return (
    <section className="mx-auto w-full max-w-[480px] px-4 pt-3 pb-5 text-[#F5E8C7] md:hidden">
      {/* Greeting row */}
      <div className="mb-4 flex items-start justify-between" data-tour="mhome-greeting">
        <div>
          <div
            className="mb-1 text-[11px] leading-tight text-[#7A7363]"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            As-salamu alaykum
          </div>
          <div
            className="text-[22px] leading-tight text-[#F5E8C7]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
          >
            Welcome
          </div>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[rgba(212,168,83,0.18)] text-[15px] text-[#E8C97A]"
          style={{
            background: 'rgba(245,232,199,0.04)',
            fontFamily: "'Cormorant Garamond', serif",
          }}
          aria-label="Profile"
        >
          {initial}
        </button>
      </div>

      {/* Raya pill */}
      <button
        onClick={() => navigate('/ai-assistant', { state: { newChat: Date.now() } })}
        data-tour="mhome-raya"
        className="mb-5 flex w-full items-center gap-3.5 rounded-3xl px-[18px] py-4 text-left transition-colors active:scale-[0.99]"
        style={{
          background:
            'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(212,168,83,0.02))',
          border: '1px solid rgba(212,168,83,0.18)',
        }}
      >
        <span
          aria-hidden="true"
          className="block h-[42px] w-[42px] shrink-0 rounded-full bk-raya-orb-pulse"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, rgba(232,201,122,0.7), rgba(212,168,83,0.3) 50%, transparent 100%)',
          }}
        />
        <div className="min-w-0 flex-1">
          <div
            className="mb-[3px] text-[9px] uppercase text-[#D4A853]"
            style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '2.4px' }}
          >
            Raya · Always Here
          </div>
          <div
            className="text-[15px] italic leading-snug text-[#F5E8C7]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            &ldquo;Ask me anything — or just say hi.&rdquo;
          </div>
        </div>
        <span className="text-[18px] leading-none text-[#E8C97A]">›</span>
      </button>

      {/* Orientation line */}
      <p
        className="mb-5 text-center text-[15px] italic leading-[1.5] text-[#7A7363]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Your main areas. Tap to open — Raya is one tap away from each.
      </p>

      {/* Tile grid */}
      <div className="grid grid-cols-2 gap-2.5 pb-4" data-tour="mhome-tiles">
        {/* Baraka Labs — featured (spans 2 cols) */}
        <button
          onClick={() => navigate('/barakah-labs')}
          data-tour="mhome-baraka"
          className="col-span-2 flex flex-col gap-1.5 rounded-[18px] p-[18px] text-left transition-colors active:scale-[0.99]"
          style={{
            background:
              'linear-gradient(135deg, rgba(212,168,83,0.06), rgba(212,168,83,0.01))',
            border: barakaFeatured
              ? '1px solid rgba(212,168,83,0.55)'
              : '1px solid rgba(212,168,83,0.18)',
            boxShadow: barakaFeatured ? '0 0 24px rgba(212,168,83,0.10)' : undefined,
          }}
        >
          <TileIcon tint="gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 21s-7-4.5-7-11a5 5 0 019-3 5 5 0 019 3c0 6.5-7 11-7 11h-4z" strokeLinejoin="round" />
            </svg>
          </TileIcon>
          <TileName name="Baraka Labs" arabic="بَرَكَة" featured />
          <TileDesc>
            {barakaFeatured
              ? 'The daily Shukr you started — keep going.'
              : 'Where you just were. The daily Shukr you started — keep going.'}
          </TileDesc>
        </button>

        {/* Mizan */}
        <TileCard onClick={() => navigate('/wallet')}>
          <TileIcon tint="emerald">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 4v16M5 9l7-5 7 5M3 14l4-4 4 4-4 4-4-4zM13 14l4-4 4 4-4 4-4-4z" />
            </svg>
          </TileIcon>
          <TileName name="Mizan" arabic="مِيزَان" />
          <TileDesc>Halal wealth. Trade with conscience.</TileDesc>
        </TileCard>

        {/* Qur'an */}
        <TileCard onClick={() => navigate('/quran')}>
          <TileIcon tint="rose">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4z" />
              <path d="M5 17h14" />
            </svg>
          </TileIcon>
          <TileName name="Qur'an" arabic="قُرْآن" />
          <TileDesc>Read, recite, return.</TileDesc>
        </TileCard>

        {/* Halaqah */}
        <TileCard onClick={() => navigate('/halaqah')}>
          <TileIcon tint="cream">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="9" cy="8" r="3" />
              <circle cx="17" cy="10" r="2.5" />
              <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
              <path d="M14 20c0-2 2-3.5 4-3.5s3 1 3 3" />
            </svg>
          </TileIcon>
          <TileName name="Halaqah" arabic="حَلْقَة" />
          <TileDesc>Real-world Muslim gatherings near you.</TileDesc>
        </TileCard>

        {/* Companions */}
        <TileCard
          onClick={() =>
            navigate('/ai-assistant', { state: { newChat: Date.now(), persona: 'companions' } })
          }
        >
          <TileIcon tint="warm-gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="9" r="3" />
              <path d="M5 21c0-3 3-5 7-5s7 2 7 5" />
              <path d="M19 7l1.5 1.5L23 6" />
            </svg>
          </TileIcon>
          <TileName name="Companions" />
          <TileDesc>Talk to the Sahaba &amp; the Four Imams.</TileDesc>
        </TileCard>

        {/* More */}
        <TileCard onClick={() => navigate('/prayer-times')}>
          <TileIcon tint="mute">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </TileIcon>
          <TileName name="More" />
          <TileDesc>Prayer times, zakat, screener, &amp; more.</TileDesc>
        </TileCard>
      </div>
    </section>
  );
}

/* ---------- tile helpers ---------- */

function TileCard({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-1.5 rounded-[18px] p-[18px] text-left transition-colors active:scale-[0.99]"
      style={{
        background: 'rgba(245,232,199,0.025)',
        border: '1px solid rgba(212,168,83,0.1)',
      }}
    >
      {children}
    </button>
  );
}

type IconTint = 'gold' | 'emerald' | 'rose' | 'cream' | 'warm-gold' | 'mute';

const TINT_STYLES: Record<IconTint, { background: string; color: string }> = {
  gold:        { background: 'rgba(212,168,83,0.08)',  color: '#E8C97A' },
  emerald:     { background: 'rgba(42,157,111,0.10)',  color: '#4FB892' },
  rose:        { background: 'rgba(201,122,107,0.08)', color: '#C97A6B' },
  cream:       { background: 'rgba(245,232,199,0.05)', color: '#C9C0A8' },
  'warm-gold': { background: 'rgba(232,201,122,0.06)', color: '#E8C97A' },
  mute:        { background: 'rgba(245,232,199,0.04)', color: '#7A7363' },
};

function TileIcon({ tint, children }: { tint: IconTint; children: React.ReactNode }) {
  const s = TINT_STYLES[tint];
  return (
    <div
      className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-[9px]"
      style={{ background: s.background, color: s.color }}
    >
      <div className="h-[18px] w-[18px]">{children}</div>
    </div>
  );
}

function TileName({ name, arabic, featured }: { name: string; arabic?: string; featured?: boolean }) {
  return (
    <div
      className="text-[18px] leading-tight"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 500,
        color: featured ? '#E8C97A' : '#F5E8C7',
        letterSpacing: '0.1px',
      }}
    >
      {name}
      {arabic && (
        <span
          className="ml-1 text-[13px] text-[#7A7363]"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {arabic}
        </span>
      )}
    </div>
  );
}

function TileDesc({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10.5px] italic leading-[1.4] text-[#7A7363]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </div>
  );
}

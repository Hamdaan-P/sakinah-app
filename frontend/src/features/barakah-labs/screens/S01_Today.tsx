import { useEffect, useMemo, useState } from 'react';
import { useBarakahFlow, isHeartFresh } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { MenuHeader } from '../components/Greet';
import { useActiveCount } from '../hooks/usePresence';
import * as barka from '@/features/barka-labs/services/barkaLabsService';
import type { Blessing } from '@/features/barka-labs/types/barka-labs.types';
import { subscribeToReceivedTohfas, type Tohfa } from '../services/tohfaService';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'A late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'A quiet night';
}

function firstName(displayName: string | undefined, email: string | undefined): string {
  if (displayName?.trim()) return displayName.trim().split(/\s+/)[0];
  if (email) return email.split('@')[0];
  return 'friend';
}

// Door-tag stripping (mirrors S16_TrailYours' parseEntry helper, kept local
// so we don't have to refactor it into a shared module just yet).
const TAG_PATTERN = /^\[([A-Za-z][A-Za-z\s-]{0,20})\]\s*/;
function parseEntry(text: string): { tag: string | null; body: string } {
  const m = text.match(TAG_PATTERN);
  if (!m) return { tag: null, body: text };
  return { tag: m[1].trim(), body: text.slice(m[0].length) };
}

function relativeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

export function S01_Today() {
  const go = useBarakahFlow((s) => s.go);
  const heart = useBarakahFlow((s) => s.heart);
  const heartHistory = useBarakahFlow((s) => s.heartHistory);
  const heartCheckedAt = useBarakahFlow((s) => s.heartCheckedAt);
  const setPendingIntent = useBarakahFlow((s) => s.setPendingIntent);
  const user = useAuthStore((s) => s.user);
  const name = firstName(user?.displayName, user?.email);

  // "Notice a blessing" intercepts to S02 if the heart hasn't been checked
  // within the last hour. If it has, proceed straight to Settle as before.
  const onNoticeBlessing = () => {
    if (isHeartFresh(heartCheckedAt)) {
      go('s03');
    } else {
      setPendingIntent('blessing');
      go('s02');
    }
  };

  const [todayCount, setTodayCount] = useState<number>(0);
  const [weekCount, setWeekCount] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [recentBlessings, setRecentBlessings] = useState<Blessing[]>([]);
  const [tohfas, setTohfas] = useState<Tohfa[]>([]);
  const presence = useActiveCount();

  // Subscribe to received Tohfas so unkept gifts surface inline on Today
  // (the only mobile entry point into s10 since the SubNav rail is hidden).
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToReceivedTohfas(user.id, setTohfas);
    return () => unsub();
  }, [user?.id]);

  const unkeptTohfas = useMemo(() => tohfas.filter((t) => !t.kept), [tohfas]);
  const latestUnkeptTohfa = unkeptTohfas[0] ?? null;

  useEffect(() => {
    let alive = true;
    if (!user?.id) return;
    void (async () => {
      try {
        const stats = await barka.getStats(user.id);
        if (!alive) return;
        const list = await barka.getBlessings(user.id, 50, 0);
        if (!alive) return;
        const today = new Date().toISOString().slice(0, 10);
        const todayN = list.blessings.filter((b) => {
          const d = new Date(b.created_at as unknown as string);
          return d.toISOString().slice(0, 10) === today;
        }).length;
        setTodayCount(todayN);

        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const weekN = list.blessings.filter((b) => {
          return new Date(b.created_at as unknown as string).getTime() >= weekAgo;
        }).length;
        setWeekCount(weekN);

        // Newest-first: the API returns blessings ordered desc — just take 3.
        setRecentBlessings(list.blessings.slice(0, 3));

        const days = new Set(heartHistory.map((h) => h.day));
        let streak = 0;
        const cursor = new Date();
        for (let i = 0; i < 365; i++) {
          const key = cursor.toISOString().slice(0, 10);
          if (days.has(key)) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
          } else if (i === 0) {
            cursor.setDate(cursor.getDate() - 1);
          } else {
            break;
          }
        }
        setStreakDays(Math.max(streak, stats.current_streak ?? 0));
      } catch {
        /* network error — leave counts at 0 */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id, heartHistory]);

  // Prefer today's persisted check-in over whatever's transiently in the
  // flow store. heartHistory is synced from Firestore at the root.
  const heartLabel = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todays = heartHistory.find((h) => h.day === today);
    return todays?.heart ?? heart ?? 'unspoken';
  }, [heart, heartHistory]);

  return (
    <div className="bk-screen">
      <MenuHeader
        left={
          <>
            <div className="bk-salam">السلام عليكم</div>
            <div className="bk-name">{greeting()}, {name}</div>
          </>
        }
      />

      {/* Mobile mockup keeps the canvas; desktop hides it via CSS */}
      <div className="bk-canvas">
        <div className="bk-glow-bg" />
        <svg viewBox="0 0 390 300" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="lightToday" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E8C97A" stopOpacity="1" />
              <stop offset="40%" stopColor="#D4A853" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lightPast" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C9C0A8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7A7363" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ember" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2A9D6F" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#2A9D6F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g opacity="0.45">
            <circle cx="60" cy="65" r="13" fill="url(#lightPast)" /><circle cx="60" cy="65" r="1.4" fill="#C9C0A8" />
            <circle cx="110" cy="130" r="11" fill="url(#lightPast)" /><circle cx="110" cy="130" r="1.2" fill="#C9C0A8" />
            <circle cx="320" cy="50" r="12" fill="url(#lightPast)" /><circle cx="320" cy="50" r="1.3" fill="#C9C0A8" />
            <circle cx="290" cy="190" r="10" fill="url(#lightPast)" /><circle cx="290" cy="190" r="1.1" fill="#C9C0A8" />
            <circle cx="50" cy="220" r="13" fill="url(#lightPast)" /><circle cx="50" cy="220" r="1.3" fill="#C9C0A8" />
            <circle cx="170" cy="250" r="11" fill="url(#lightPast)" /><circle cx="170" cy="250" r="1.2" fill="#C9C0A8" />
            <circle cx="350" cy="250" r="10" fill="url(#lightPast)" /><circle cx="350" cy="250" r="1.1" fill="#C9C0A8" />
            <circle cx="230" cy="80" r="9" fill="url(#lightPast)" /><circle cx="230" cy="80" r="1" fill="#C9C0A8" />
            <circle cx="20" cy="160" r="9" fill="url(#lightPast)" /><circle cx="20" cy="160" r="1" fill="#C9C0A8" />
            <circle cx="370" cy="150" r="10" fill="url(#lightPast)" /><circle cx="370" cy="150" r="1.1" fill="#C9C0A8" />
          </g>
          <circle cx="195" cy="140" r="28" fill="url(#lightToday)">
            <animate attributeName="r" values="26;32;26" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="195" cy="140" r="2.4" fill="#F5E8C7" />
          <circle cx="140" cy="190" r="20" fill="url(#lightToday)">
            <animate attributeName="r" values="18;24;18" dur="4s" begin="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="190" r="1.8" fill="#F5E8C7" />
          <circle cx="250" cy="170" r="18" fill="url(#lightToday)">
            <animate attributeName="r" values="16;22;16" dur="4s" begin="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="170" r="1.6" fill="#F5E8C7" />
          <circle cx="195" cy="140" r="75" fill="url(#ember)" opacity="0.35" />
        </svg>
      </div>

      <button className="bk-heart-chip" onClick={() => go('s02')}>
        <span className="label">How is your heart today?</span>
        <span className="value">{heartLabel}</span>
      </button>

      <div className="bk-invitation">
        <div className="bk-prompt-eyebrow bk-desktop-hidden">A small noticing</div>

        <div className="bk-prompt">
          What did Allah <em>show you</em> today?
        </div>

        <div className="bk-tagline bk-mobile-hidden">
          A small noticing. A daily return.
        </div>

        <div className="bk-description bk-mobile-hidden">
          Train the eye to see the extraordinary in the ordinary.
          Build the habit of quiet attention — one moment, one Alhamdulillah at a time.
        </div>

        <div className="bk-cta-row">
          <button className="bk-cta" onClick={onNoticeBlessing}>Notice a blessing</button>
          <button className="bk-cta-outline" onClick={() => go('s11')}>
            Sit in tafakkur
          </button>
        </div>

        <div className="bk-continuity">
          <span>{todayCount} noticed today</span>
          <span className="sep" />
          <span>a quiet {streakDays} days</span>
        </div>

        <div className="bk-presence-line bk-desktop-hidden">
          <span className="pulse" />
          <span>
            {presence === 1 ? 'You are noticing right now' : `${presence} are noticing right now`}
          </span>
        </div>

      </div>

      {/* ── Mobile-only inline sections ─────────────────────────────────────
          Replace the abandoned top-tab nav: Trail, Weekly, and incoming Tohfas
          surface by scrolling Today instead of via a separate tab. */}

      {/* Tohfa inbox — only renders when there's at least one unkept gift.
          s10 (Tohfa received) has no other mobile entry point. */}
      {latestUnkeptTohfa && (
        <section className="bk-today-section bk-today-gift">
          <div className="bk-today-section-eyebrow">a gift arrived</div>
          <div className="bk-today-gift-preview">
            <span className="bk-today-gift-from">from a companion</span>
            <span className="bk-today-gift-letter">
              {(latestUnkeptTohfa.letter ?? '').split('\n')[0].slice(0, 120)}
              {(latestUnkeptTohfa.letter ?? '').length > 120 ? '…' : ''}
            </span>
          </div>
          <button type="button" className="bk-today-link" onClick={() => go('s10')}>
            open your {unkeptTohfas.length === 1 ? 'gift' : `gifts (${unkeptTohfas.length})`} →
          </button>
        </section>
      )}

      <section className="bk-today-section">
        <div className="bk-today-section-eyebrow">your trail</div>
        {recentBlessings.length === 0 ? (
          <p className="bk-today-trail-empty">
            Nothing here yet — your first noticing will land here.
          </p>
        ) : (
          recentBlessings.map((b) => {
            const parsed = parseEntry(b.text);
            return (
              <div key={b.id} className="bk-today-trail-item">
                <div className="bk-today-trail-item-body">
                  <span className="bk-today-trail-bullet">·</span>
                  <span>{parsed.body}</span>
                </div>
                <div className="bk-today-trail-meta">
                  {relativeAgo(b.created_at as unknown as string)}
                  {parsed.tag && <> · <span className="tag">{parsed.tag}</span></>}
                </div>
              </div>
            );
          })
        )}
        <button type="button" className="bk-today-link" onClick={() => go('s16')}>
          see all of your trail →
        </button>
      </section>

      <section className="bk-today-section">
        <div className="bk-today-section-eyebrow">this week</div>
        <div className="bk-today-week-stats">
          <div className="bk-today-week-stat">
            <span className="glyph">✦</span>
            <span>a quiet {streakDays} {streakDays === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="bk-today-week-stat">
            <span className="glyph">✦</span>
            <span>{weekCount} {weekCount === 1 ? 'noticing' : 'noticings'}</span>
          </div>
        </div>
        <button type="button" className="bk-today-link" onClick={() => go('s19')}>
          open weekly report →
        </button>
      </section>

      <div className="bk-today-footer-spacer" />
    </div>
  );
}

/**
 * S16_TrailYours — the user's private noticings trail.
 *
 * Redesigned 2026-05-23 to match the cleaned S17 / S18 aesthetic:
 *   - Clean sans-serif header (name + subtitle stats line — no billboard).
 *   - Single-column feed of noticings as chat-style cards.
 *   - Door tags ([Trials], [Fear], [Dua], [Action], [Tohfa]) extracted from
 *     the blessing text and surfaced as small gold chips on each card.
 *   - Day separators ("Today" / "Yesterday" / weekday name / date) between
 *     entries, reusing the bk-c2-day-sep style from S18.
 *   - Single prominent Quiet Report card at the top. The old "What Raya is
 *     noticing in you" / "companion is taking shape" cards were dropped —
 *     they read as ad copy and not real Raya output.
 */
import { useEffect, useMemo, useState } from 'react';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { BackHeader } from '../components/Greet';
import type { Blessing } from '@/features/barka-labs/types/barka-labs.types';
import {
  fetchBlessingTotal,
  fetchBlessingsFirstPage,
  fetchBlessingsNextPage,
} from '../services/blessingsPagination';
import type { DocumentSnapshot } from 'firebase/firestore';

// ── Time helpers (mirror S18 patterns) ────────────────────────────────────

function ago(ms: number): string {
  if (!ms) return 'just now';
  const diff = Date.now() - ms;
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

function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(ms: number): string {
  if (!ms) return 'Today';
  const d = new Date(ms);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((today - target) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── Door-tag extraction ───────────────────────────────────────────────────

const TAG_PATTERN = /^\[([A-Za-z][A-Za-z\s-]{0,20})\]\s*/;

interface ParsedEntry {
  tag: string | null;
  body: string;
}

function parseEntry(text: string): ParsedEntry {
  const m = text.match(TAG_PATTERN);
  if (!m) return { tag: null, body: text };
  return { tag: m[1].trim(), body: text.slice(m[0].length) };
}

// ── Feed item builder (with day separators) ───────────────────────────────

type FeedItem =
  | { kind: 'sep'; key: string; label: string }
  | { kind: 'entry'; key: string; blessing: Blessing; ms: number; parsed: ParsedEntry };

function buildFeedItems(blessings: Blessing[]): FeedItem[] {
  const items: FeedItem[] = [];
  let lastDay: string | null = null;
  for (const b of blessings) {
    const ms = new Date(b.created_at as unknown as string).getTime();
    const key = dayKey(ms);
    if (key !== lastDay) {
      items.push({ kind: 'sep', key: `sep-${key}-${items.length}`, label: dayLabel(ms) });
      lastDay = key;
    }
    items.push({
      kind: 'entry',
      key: `e-${b.id}`,
      blessing: b,
      ms,
      parsed: parseEntry(b.text),
    });
  }
  return items;
}

// ── Streak ────────────────────────────────────────────────────────────────

function computeSteady(blessings: Blessing[]): number {
  if (!blessings.length) return 0;
  const days = new Set(
    blessings.map((b) =>
      new Date(b.created_at as unknown as string).toISOString().slice(0, 10),
    ),
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
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
  return streak;
}

// ── Main screen ───────────────────────────────────────────────────────────

export function S16_TrailYours() {
  const go = useBarakahFlow((s) => s.go);
  const user = useAuthStore((s) => s.user);
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [memberSince, setMemberSince] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [cursor, setCursor] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    setLoadingInitial(true);
    void (async () => {
      try {
        const [first, count] = await Promise.all([
          fetchBlessingsFirstPage(user.id),
          fetchBlessingTotal(user.id),
        ]);
        if (!alive) return;
        setBlessings(first.blessings);
        setCursor(first.cursor);
        setHasMore(first.hasMore);
        setTotal(count);
        const oldest = first.blessings[first.blessings.length - 1];
        if (oldest) {
          const d = new Date(oldest.created_at as unknown as string);
          setMemberSince(d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }));
        }
      } catch {
        /* offline — show empty trail */
      } finally {
        if (alive) setLoadingInitial(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const loadMore = async () => {
    if (!user?.id || !cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await fetchBlessingsNextPage(user.id, cursor);
      setBlessings((prev) => [...prev, ...next.blessings]);
      setCursor(next.cursor);
      setHasMore(next.hasMore);
    } catch {
      /* fail-quiet */
    } finally {
      setLoadingMore(false);
    }
  };

  const steady = useMemo(() => computeSteady(blessings), [blessings]);
  const feedItems = useMemo(() => buildFeedItems(blessings), [blessings]);
  const totalShown = total || blessings.length;

  return (
    <div className="bk-screen bk-c2-screen">
      <BackHeader to="s01" center={<div className="bk-salam alt">Your trail</div>} />

      <div className="bk-subnav">
        <div className="bk-subnav-item active">Yours</div>
        <button className="bk-subnav-item" onClick={() => go('s17')}>Companions</button>
      </div>

      {/* Clean header — mirrors S18 pattern (name + meta line) */}
      <div className="bk-trail-v2-header">
        <div className="bk-trail-v2-header-main">
          <div className="bk-trail-v2-name">
            {steady > 0
              ? `${steady === 1 ? 'One quiet day' : `${steady} quiet days`} of noticing`
              : 'Your trail'}
          </div>
          <div className="bk-trail-v2-meta">
            <span>{totalShown} {totalShown === 1 ? 'noticing' : 'noticings'}</span>
            {memberSince ? (
              <>
                <span className="dot" aria-hidden>·</span>
                <span>since {memberSince}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Quiet Report — single prominent gold card */}
      <button
        type="button"
        className="bk-trail-v2-report"
        onClick={() => go('s19')}
      >
        <div className="bk-trail-v2-report-label">Your Quiet Report · this Friday</div>
        <div className="bk-trail-v2-report-body">
          Raya has written a letter about your week.
          <span className="bk-trail-v2-report-arrow"> Read it →</span>
        </div>
      </button>

      {/* Feed — chat-style cards with day separators */}
      <div className="bk-c2-feed">
        {loadingInitial ? (
          <div className="bk-c2-empty">
            <div className="bk-c2-empty-body">Loading your trail…</div>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="bk-c2-empty">
            <div className="bk-c2-empty-title">No noticings yet.</div>
            <div className="bk-c2-empty-body">
              The first one is always the smallest. Tap &ldquo;Notice a blessing&rdquo; on the home
              screen to log a moment — even one word is enough.
            </div>
          </div>
        ) : (
          <>
            {feedItems.map((it) => {
              if (it.kind === 'sep') {
                return (
                  <div key={it.key} className="bk-c2-day-sep">
                    <span>{it.label}</span>
                  </div>
                );
              }
              return (
                <div key={it.key} className="bk-trail-v2-entry">
                  <div className="bk-trail-v2-entry-head">
                    {it.parsed.tag ? (
                      <span className="bk-trail-v2-tag">{it.parsed.tag}</span>
                    ) : (
                      <span className="bk-trail-v2-tag bk-trail-v2-tag-plain">Noticing</span>
                    )}
                    <span
                      className="bk-trail-v2-time"
                      title={new Date(it.ms).toLocaleString()}
                    >
                      {ago(it.ms)}
                    </span>
                  </div>
                  <div className="bk-trail-v2-body">{it.parsed.body}</div>
                </div>
              );
            })}

            {hasMore ? (
              <button
                type="button"
                className="bk-trail-v2-load-more"
                onClick={() => void loadMore()}
                disabled={loadingMore}
              >
                {loadingMore
                  ? 'Loading…'
                  : `Load ${Math.min(20, total - blessings.length)} more`}
              </button>
            ) : blessings.length > 0 ? (
              <div className="bk-trail-v2-end">That&apos;s the whole trail, for now.</div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

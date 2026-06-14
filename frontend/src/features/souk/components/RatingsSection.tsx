/**
 * Ratings section for a listing detail page.
 *
 * - Shows aggregate (count + average) at the top
 * - Lets the viewer rate 1-5 + optional text (one rating per user; re-rating
 *   overwrites the previous score). Sellers can't rate their own listings.
 * - Lists the most recent 50 ratings underneath.
 */

import { useEffect, useState } from 'react';
import { Star, StarHalf } from '@phosphor-icons/react';
import { fetchRatings, rateListing, type Rating } from '../services/soukService';
import { useAuthStore, selectUser } from '@/core/stores/auth.store';

interface Props {
  listingId: string;
  sellerId: string;
  initialCount?: number;
  initialAverage?: number | null;
}

export function RatingsSection({ listingId, sellerId, initialCount = 0, initialAverage = null }: Props) {
  const me = useAuthStore(selectUser);
  const isOwner = me?.id === sellerId;

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [count, setCount] = useState(initialCount);
  const [average, setAverage] = useState<number | null>(initialAverage);
  const [loading, setLoading] = useState(true);

  const [myScore, setMyScore] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [myText, setMyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRatings(listingId)
      .then((items) => {
        if (cancelled) return;
        setRatings(items);
        setCount(items.length);
        if (items.length > 0) {
          const sum = items.reduce((s, r) => s + r.score, 0);
          setAverage(sum / items.length);
        } else {
          setAverage(null);
        }
        if (me?.id) {
          const mine = items.find((r) => r.userId === me.id);
          if (mine) {
            setMyScore(mine.score as 1 | 2 | 3 | 4 | 5);
            setMyText(mine.text ?? '');
          }
        }
      })
      .catch(() => { /* show empty */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [listingId, me?.id]);

  async function submit() {
    if (!myScore) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await rateListing(listingId, myScore, myText.trim() || undefined);
      setCount(r.ratingCount);
      setAverage(r.ratingAverage);
      // Optimistically prepend/replace own rating in the list.
      setRatings((prev) => {
        const filtered = prev.filter((p) => p.userId !== me?.id);
        return [
          { userId: me?.id ?? '', score: myScore, text: myText, createdAt: Date.now() },
          ...filtered,
        ];
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your rating');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[rgba(215,181,106,0.18)] bg-[#2C3C55]/40 p-4 space-y-4">
      <header className="flex items-baseline justify-between">
        <h2 className="text-[#EBDCB8] font-semibold text-base">Ratings</h2>
        {count > 0 && (
          <div className="flex items-center gap-1.5 text-[#D7B56A]">
            <StarsRow score={average ?? 0} size={14} />
            <span className="text-sm font-bold">{average?.toFixed(1)}</span>
            <span className="text-[#A7B1C0] text-xs">({count})</span>
          </div>
        )}
      </header>

      {!isOwner && me?.id && (
        <div className="rounded-xl border border-[rgba(215,181,106,0.18)] bg-[#1E293A]/60 p-3 space-y-2">
          <p className="text-[#A7B1C0] text-xs">
            {ratings.find((r) => r.userId === me.id) ? 'Update your rating' : 'Rate this listing'}
          </p>
          <RatingInput score={myScore} onChange={setMyScore} />
          <textarea
            value={myText}
            onChange={(e) => setMyText(e.target.value)}
            placeholder="A short note about your experience (optional)"
            rows={2}
            maxLength={1000}
            className="w-full rounded-lg bg-[#1E293A] border border-[rgba(215,181,106,0.18)] text-[#EBDCB8] text-sm px-3 py-2 placeholder-[#56627A]"
          />
          {error && <p className="text-rose-400 text-xs">{error}</p>}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!myScore || submitting}
              onClick={submit}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D7B56A] to-[#E7CF8C] text-[#1E293A] font-bold text-xs disabled:opacity-40"
            >
              {submitting ? 'Saving…' : 'Submit rating'}
            </button>
          </div>
        </div>
      )}

      {isOwner && (
        <p className="text-[#A7B1C0] text-xs italic">
          You can't rate your own listing — buyers' ratings will appear here.
        </p>
      )}

      {loading ? (
        <p className="text-[#A7B1C0] text-xs">Loading…</p>
      ) : ratings.length === 0 ? (
        <p className="text-[#A7B1C0] text-xs">No ratings yet. Be the first to leave one.</p>
      ) : (
        <ul className="space-y-2.5">
          {ratings.map((r) => (
            <li
              key={`${r.userId}-${r.createdAt}`}
              className="rounded-lg border border-[rgba(215,181,106,0.10)] bg-[#1E293A]/40 p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <StarsRow score={r.score} size={12} />
                <span className="text-[10px] text-[#A7B1C0]">{relativeTime(r.createdAt)}</span>
              </div>
              {r.text && <p className="text-[#D5DDEA] text-xs leading-snug whitespace-pre-line">{r.text}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RatingInput({
  score,
  onChange,
}: {
  score: 0 | 1 | 2 | 3 | 4 | 5;
  onChange: (s: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = (hover || score) >= i;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${i} star${i === 1 ? '' : 's'}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i as 1 | 2 | 3 | 4 | 5)}
            className="p-0.5"
          >
            <Star
              size={22}
              weight={active ? 'fill' : 'regular'}
              className={active ? 'text-[#D7B56A]' : 'text-[#56627A]'}
            />
          </button>
        );
      })}
    </div>
  );
}

function StarsRow({ score, size }: { score: number; size: number }) {
  // Render 5 stars with fill for whole-units and a half for the fractional part.
  const full = Math.floor(score);
  const hasHalf = score - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        if (i < full) {
          return <Star key={i} size={size} weight="fill" className="text-[#D7B56A]" />;
        }
        if (i === full && hasHalf) {
          return <StarHalf key={i} size={size} weight="fill" className="text-[#D7B56A]" />;
        }
        return <Star key={i} size={size} weight="regular" className="text-[#56627A]" />;
      })}
    </div>
  );
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const min = 60_000;
  if (diff < min) return 'just now';
  if (diff < 60 * min) return `${Math.round(diff / min)}m ago`;
  if (diff < 24 * 60 * min) return `${Math.round(diff / (60 * min))}h ago`;
  if (diff < 30 * 24 * 60 * min) return `${Math.round(diff / (24 * 60 * min))}d ago`;
  return new Date(ms).toLocaleDateString();
}

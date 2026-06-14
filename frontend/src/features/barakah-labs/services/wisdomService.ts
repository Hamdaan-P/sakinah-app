/**
 * Wisdom feed — community noticings shared via S03's "Share with the
 * community" toggle, ranked by a recency-decayed-likes "hot score":
 *
 *   score = (likes + 1) / (hoursAgo + 2) ^ 1.5
 *
 * Source: the FastAPI `/barka-labs/community` endpoint, which reads
 * `public_blessings` via the Admin SDK and bypasses Firestore rules.
 * We deliberately do NOT read `public_blessings` directly from the
 * client — that path requires a rules deploy and fails silently for
 * any user until the deploy lands.
 *
 * Caching: two layers, both keyed by `limit`:
 *   1. module-level in-memory map (lives for the tab session)
 *   2. sessionStorage (survives soft navigations / route remounts)
 * TTL is 60s. A stale entry is returned immediately so the section
 * paints instantly, then a background fetch refreshes it.
 */

import { authGet } from '@/lib/api';

export interface WisdomCard {
  id: string;
  text: string;
  depth: string;
  score: number;
  createdAt: number;       // ms
  likesCount: number;
  hotScore: number;        // computed
}

interface BackendBlessing {
  id: string;
  text: string;
  score: number;
  depth: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
}

interface BackendFeedResponse {
  blessings: BackendBlessing[];
  next_cursor: string | null;
  count: number;
}

const CACHE_TTL_MS = 60_000;
const CACHE_KEY_PREFIX = 'bk-wisdom-feed-v1';

interface CacheEntry {
  ts: number;
  cards: WisdomCard[];
}

const memCache = new Map<number, CacheEntry>();

function hoursSince(createdAtMs: number, nowMs: number): number {
  return Math.max(0, (nowMs - createdAtMs) / 3_600_000);
}

export function computeHotScore(likes: number, createdAtMs: number, nowMs: number = Date.now()): number {
  return (likes + 1) / Math.pow(hoursSince(createdAtMs, nowMs) + 2, 1.5);
}

function parseCreatedAt(raw: string): number {
  if (!raw) return 0;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : 0;
}

function normalize(b: BackendBlessing): WisdomCard {
  const createdAt = parseCreatedAt(b.created_at);
  const likes = b.likes_count ?? 0;
  return {
    id: b.id,
    text: b.text ?? '',
    depth: b.depth ?? 'common',
    score: b.score ?? 1,
    createdAt,
    likesCount: likes,
    hotScore: computeHotScore(likes, createdAt),
  };
}

function readSessionCache(limit: number): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY_PREFIX}:${limit}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || typeof parsed.ts !== 'number' || !Array.isArray(parsed.cards)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionCache(limit: number, entry: CacheEntry): void {
  try {
    sessionStorage.setItem(`${CACHE_KEY_PREFIX}:${limit}`, JSON.stringify(entry));
  } catch {
    // sessionStorage can throw under quota / private mode — non-fatal.
  }
}

function rankAndTrim(cards: WisdomCard[], limit: number): WisdomCard[] {
  const now = Date.now();
  return [...cards]
    .map((c) => ({ ...c, hotScore: computeHotScore(c.likesCount, c.createdAt, now) }))
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, limit);
}

/**
 * Fetch wisdom feed from the backend, rank by hot-score, return top `limit`.
 * Filters down to the last 7 days; widens to 30 days only if the 7-day
 * pool is thinner than `limit`.
 */
async function fetchFromBackend(limit: number): Promise<WisdomCard[]> {
  // Over-fetch so we have enough after time-window filtering + ranking.
  const fetchLimit = Math.min(50, Math.max(limit * 4, 20));
  const res = await authGet<BackendFeedResponse>(`/barka-labs/community?limit=${fetchLimit}`);
  const all = (res.blessings ?? []).map(normalize).filter((c) => c.createdAt > 0);

  const now = Date.now();
  const sevenDayMs = now - 7 * 24 * 3_600_000;
  const thirtyDayMs = now - 30 * 24 * 3_600_000;

  const recent = all.filter((c) => c.createdAt >= sevenDayMs);
  const pool = recent.length >= limit ? recent : all.filter((c) => c.createdAt >= thirtyDayMs);
  return rankAndTrim(pool, limit);
}

/** Synchronous read of the freshest cached value. Used to paint instantly. */
export function getCachedWisdomFeed(limit: number = 6): WisdomCard[] | null {
  const mem = memCache.get(limit);
  if (mem) return mem.cards;
  const sess = readSessionCache(limit);
  if (sess) {
    memCache.set(limit, sess);
    return sess.cards;
  }
  return null;
}

/**
 * Live-ish wisdom feed: paints the cached snapshot synchronously, then
 * fetches fresh data and re-emits if it changed. Polls every 60s while
 * the subscriber is active. Returns an unsubscribe function.
 */
export function subscribeToWisdomFeed(
  cb: (cards: WisdomCard[]) => void,
  limit: number = 6,
): () => void {
  let alive = true;
  let timer: ReturnType<typeof setInterval> | null = null;

  const cached = getCachedWisdomFeed(limit);
  if (cached) cb(cached);

  const refresh = async (): Promise<void> => {
    try {
      const fresh = await fetchFromBackend(limit);
      if (!alive) return;
      const entry: CacheEntry = { ts: Date.now(), cards: fresh };
      memCache.set(limit, entry);
      writeSessionCache(limit, entry);
      cb(fresh);
    } catch {
      // Network/backend error — keep whatever cached cards we already emitted.
      // If we have no cache at all, emit empty so the UI leaves the loading state.
      if (alive && !cached) cb([]);
    }
  };

  // Skip the network round-trip if the cache is still fresh; just paint.
  const cachedEntry = memCache.get(limit) ?? readSessionCache(limit);
  const fresh = cachedEntry && Date.now() - cachedEntry.ts < CACHE_TTL_MS;
  if (!fresh) {
    void refresh();
  }

  timer = setInterval(() => {
    void refresh();
  }, CACHE_TTL_MS);

  return () => {
    alive = false;
    if (timer) clearInterval(timer);
  };
}

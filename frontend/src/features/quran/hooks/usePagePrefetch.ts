import { useEffect, useRef, useState } from 'react';
import { fetchPage } from '../services/quranApiService';
import type { QuranLine, MushafLine } from '../types/quran.types';

export interface PageData {
  lines: QuranLine[];
  pageLines: MushafLine[];
  meta: { juz: number; hizb: number };
}

const cache = new Map<number, PageData>();
const inflight = new Map<number, Promise<PageData>>();

const MIN_PAGE = 1;
const MAX_PAGE = 604;

function loadInto(n: number): Promise<PageData> {
  if (cache.has(n)) return Promise.resolve(cache.get(n)!);
  const existing = inflight.get(n);
  if (existing) return existing;
  const p = fetchPage(n)
    .then((res) => {
      const data: PageData = { lines: res.lines, pageLines: res.pageLines, meta: res.meta };
      cache.set(n, data);
      inflight.delete(n);
      return data;
    })
    .catch((err) => {
      inflight.delete(n);
      throw err;
    });
  inflight.set(n, p);
  return p;
}

/** Synchronous cache lookup — useful for the flipper to render adjacent pages without a flicker. */
export function getCachedPage(n: number): PageData | undefined {
  return cache.get(n);
}

/**
 * Loads page `n` (returning loading + data states) and opportunistically
 * prefetches `n-1` and `n+1` so a swipe feels instant. Trims entries far
 * from the current page to keep memory bounded.
 */
export function usePagePrefetch(pageNumber: number) {
  const [data, setData] = useState<PageData | undefined>(() => cache.get(pageNumber));
  const [loading, setLoading] = useState(!cache.has(pageNumber));
  const seqRef = useRef(0);

  useEffect(() => {
    const seq = ++seqRef.current;
    const cached = cache.get(pageNumber);
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
      loadInto(pageNumber)
        .then((d) => {
          if (seq === seqRef.current) {
            setData(d);
            setLoading(false);
          }
        })
        .catch(() => {
          if (seq === seqRef.current) {
            setData(undefined);
            setLoading(false);
          }
        });
    }

    // Prefetch neighbours
    if (pageNumber + 1 <= MAX_PAGE) loadInto(pageNumber + 1).catch(() => {});
    if (pageNumber - 1 >= MIN_PAGE) loadInto(pageNumber - 1).catch(() => {});

    // Trim cache: keep ±3 around current
    for (const key of cache.keys()) {
      if (Math.abs(key - pageNumber) > 3) cache.delete(key);
    }
  }, [pageNumber]);

  return { data, loading };
}

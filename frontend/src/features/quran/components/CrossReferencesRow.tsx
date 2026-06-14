/**
 * CrossReferencesRow
 *
 * Horizontal scroller of Quran verses semantically related to the current
 * ayah. Each chip is clickable — clicking jumps the reader to that verse_key.
 * Backed by the verified `[QURAN:s:a]` post-processing pipeline on the server.
 */

import { useCallback, useEffect, useState } from 'react';
import type { CrossReference } from '../types/quran.types';
import { fetchCrossReferences, clearCrossReferenceCache } from '../services/crossReferenceService';

interface Props {
  verseKey: string;
  onJump?: (verseKey: string) => void;
  className?: string;
}

export function CrossReferencesRow({ verseKey, onJump, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CrossReference[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchCrossReferences(verseKey, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load cross-references.');
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, [verseKey]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`} aria-busy="true">
        <div className="h-7 w-32 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-7 w-28 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-7 w-36 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-xs text-slate-500 ${className ?? ''}`}>
        Could not load related verses.{' '}
        <button
          type="button"
          onClick={() => {
            clearCrossReferenceCache();
            void load();
          }}
          className="text-primaryTeal underline"
        >
          retry
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Related verses
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((x) => (
          <button
            key={x.verse_key}
            type="button"
            onClick={() => onJump?.(x.verse_key)}
            disabled={!onJump}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              border border-primaryTeal/20 bg-primaryTeal/5 hover:bg-primaryTeal/15
              text-xs text-primaryTeal disabled:cursor-default transition-colors max-w-xs"
            title={x.english_text}
          >
            <span aria-hidden="true">☾</span>
            <span className="font-medium">{x.verse_key}</span>
            {x.surah_name && <span className="text-slate-500 dark:text-slate-400">· {x.surah_name}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
